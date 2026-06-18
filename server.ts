import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import OpenAI from 'openai';

// Initialize Firebase Admin (Uses Default Credentials automatically in Cloud Run)
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const auth = getAuth();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for User Credits and Initialization
  app.post('/api/user/sync', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
         res.status(401).json({ error: 'Unauthorized' });
         return;
      }
      
      const token = authHeader.split('Bearer ')[1];
      const decoded = await auth.verifyIdToken(token);
      
      const userRef = db.collection('users').doc(decoded.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        await userRef.set({
          uid: decoded.uid,
          email: decoded.email,
          credits: 100, // 100 Free credits on sign up
          subscriptionTier: 'Free',
          createdAt: new Date()
        });
      }
      
      const updatedDoc = await userRef.get();
      res.json(updatedDoc.data());
    } catch (error: any) {
      console.error("Sync Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy to OpenAI Chat API
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
         res.status(401).json({ error: 'Unauthorized' });
         return;
      }
      
      const token = authHeader.split('Bearer ')[1];
      const decoded = await auth.verifyIdToken(token);
      
      const userRef = db.collection('users').doc(decoded.uid);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      
      if (!userData || userData.credits < 1) {
         res.status(402).json({ error: 'Insufficient credits' });
         return;
      }

      const { messages } = req.body;
      const openai = new OpenAI();
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages,
      });

      // Deduct 1 credit
      await userRef.update({ credits: userData.credits - 1 });
      
      res.json(response.choices[0].message);
    } catch (error: any) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy to OpenAI Image API
  app.post('/api/ai/image', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
         res.status(401).json({ error: 'Unauthorized' });
         return;
      }
      
      const token = authHeader.split('Bearer ')[1];
      const decoded = await auth.verifyIdToken(token);
      
      const userRef = db.collection('users').doc(decoded.uid);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      
      // Image costs 5 credits
      if (!userData || userData.credits < 5) {
         res.status(402).json({ error: 'Insufficient credits (Image gen costs 5 credits)' });
         return;
      }

      const { prompt } = req.body;
      const openai = new OpenAI();
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });

      // Deduct 5 credits
      await userRef.update({ credits: userData.credits - 5 });
      
      // Save generation
      await db.collection("generations").add({
        uid: decoded.uid,
        type: "image",
        prompt: prompt,
        resultUrl: response.data[0].url,
        cost: 5,
        createdAt: new Date()
      });

      res.json({ url: response.data[0].url });
    } catch (error: any) {
      console.error("Image Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Simulated Video API proxy (Sora does not have public API endpoints yet)
  app.post('/api/ai/video', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
         res.status(401).json({ error: 'Unauthorized' });
         return;
      }
      
      const token = authHeader.split('Bearer ')[1];
      const decoded = await auth.verifyIdToken(token);
      
      const userRef = db.collection('users').doc(decoded.uid);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      
      // Video costs 20 credits
      if (!userData || userData.credits < 20) {
         res.status(402).json({ error: 'Insufficient credits (Video gen costs 20 credits)' });
         return;
      }

      const { prompt } = req.body;
      
      // Since Sora API isn't live yet in typical SDK, we just wait a bit and return a placeholder video/gif 
      // representing the requested generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const placeholderVideo = "https://www.w3schools.com/html/mov_bbb.mp4"; // Placeholder

      // Deduct 20 credits
      await userRef.update({ credits: userData.credits - 20 });
      
      await db.collection("generations").add({
        uid: decoded.uid,
        type: "video",
        prompt: prompt,
        resultUrl: placeholderVideo,
        cost: 20,
        createdAt: new Date()
      });

      res.json({ url: placeholderVideo, note: 'Mocked Sora output: API not publicly accessible yet' });
    } catch (error: any) {
      console.error("Video Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

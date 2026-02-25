export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Content } from '@/models/Content'

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    // Sample content with images and interactive elements
    const sampleContent = [
      {
        title: "Math Adventure: Counting with Animals",
        description: "Learn counting through interactive animal stories with beautiful illustrations",
        type: "game",
        category: "math",
        difficulty: "beginner",
        estimatedDuration: 15,
        content: {
          text: "Welcome to the animal counting adventure! Help the zookeeper count all the animals.",
          images: [
            "https://images.unsplash.com/photo-1549366021-9f761d040a93?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400&h=300&fit=crop"
          ],
          interactive: {
            type: "counting_game",
            animals: ["lion", "elephant", "giraffe", "monkey", "zebra"],
            targetCount: 5
          }
        },
        metadata: {
          tags: ["counting", "animals", "interactive", "visual"],
          ageRange: { min: 4, max: 8 },
          adhdFriendly: true,
          attentionLevel: 0.8,
          engagementScore: 0.9,
          accessibility: {
            visual: true,
            auditory: true,
            kinesthetic: true
          }
        }
      },
      {
        title: "Reading Comprehension: The Magic Forest",
        description: "An engaging story about a magical forest with comprehension questions",
        type: "lesson",
        category: "reading",
        difficulty: "intermediate",
        estimatedDuration: 20,
        content: {
          text: "Once upon a time, in a magical forest far away, there lived a wise old owl named Oliver. The forest was filled with talking animals and sparkling trees that glowed at night...",
          images: [
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop"
          ],
          interactive: {
            type: "comprehension_quiz",
            questions: [
              {
                question: "What was the owl's name?",
                options: ["Oliver", "Oscar", "Owen", "Otis"],
                correct: 0
              },
              {
                question: "What made the forest magical?",
                options: ["Talking animals", "Sparkling trees", "Both A and B", "None of the above"],
                correct: 2
              }
            ]
          }
        },
        metadata: {
          tags: ["reading", "comprehension", "story", "magic"],
          ageRange: { min: 6, max: 10 },
          adhdFriendly: true,
          attentionLevel: 0.6,
          engagementScore: 0.7,
          accessibility: {
            visual: true,
            auditory: true,
            kinesthetic: false
          }
        }
      },
      {
        title: "Science Explorer: Solar System Journey",
        description: "Explore the solar system with interactive 3D models and fun facts",
        type: "exercise",
        category: "science",
        difficulty: "intermediate",
        estimatedDuration: 25,
        content: {
          text: "Join us on an amazing journey through our solar system! Learn about planets, moons, and space phenomena.",
          images: [
            "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=300&fit=crop"
          ],
          interactive: {
            type: "planet_explorer",
            planets: [
              { name: "Mercury", distance: 0.4, size: 0.38, color: "#8c7853" },
              { name: "Venus", distance: 0.7, size: 0.95, color: "#ffc649" },
              { name: "Earth", distance: 1.0, size: 1.0, color: "#6b93d6" },
              { name: "Mars", distance: 1.5, size: 0.53, color: "#c1440e" }
            ]
          }
        },
        metadata: {
          tags: ["science", "space", "planets", "interactive"],
          ageRange: { min: 8, max: 12 },
          adhdFriendly: true,
          attentionLevel: 0.7,
          engagementScore: 0.8,
          accessibility: {
            visual: true,
            auditory: true,
            kinesthetic: true
          }
        }
      },
      {
        title: "Attention Training: Focus Builder",
        description: "Interactive exercises designed to improve attention and focus",
        type: "exercise",
        category: "attention",
        difficulty: "beginner",
        estimatedDuration: 10,
        content: {
          text: "Practice your focus with these specially designed attention training exercises.",
          images: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"
          ],
          interactive: {
            type: "attention_training",
            exercises: [
              {
                name: "Color Word Test",
                description: "Say the color of the word, not the word itself",
                duration: 60
              },
              {
                name: "Number Sequence",
                description: "Remember and repeat number sequences",
                duration: 45
              }
            ]
          }
        },
        metadata: {
          tags: ["attention", "focus", "training", "cognitive"],
          ageRange: { min: 6, max: 16 },
          adhdFriendly: true,
          attentionLevel: 0.9,
          engagementScore: 0.6,
          accessibility: {
            visual: true,
            auditory: true,
            kinesthetic: false
          }
        }
      },
      {
        title: "Memory Palace: Remember Everything",
        description: "Learn memory techniques through interactive visual exercises",
        type: "game",
        category: "memory",
        difficulty: "intermediate",
        estimatedDuration: 18,
        content: {
          text: "Build your memory palace and learn to remember anything! Use visual associations and spatial memory.",
          images: [
            "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
          ],
          interactive: {
            type: "memory_palace",
            rooms: [
              { name: "Kitchen", items: ["apple", "spoon", "plate", "cup"] },
              { name: "Bedroom", items: ["pillow", "lamp", "book", "clock"] },
              { name: "Garden", items: ["flower", "tree", "bench", "bird"] }
            ]
          }
        },
        metadata: {
          tags: ["memory", "visual", "techniques", "cognitive"],
          ageRange: { min: 8, max: 16 },
          adhdFriendly: true,
          attentionLevel: 0.8,
          engagementScore: 0.8,
          accessibility: {
            visual: true,
            auditory: true,
            kinesthetic: true
          }
        }
      }
    ]

    // Clear existing content and insert new sample content
    await Content.deleteMany({})
    const createdContent = await Content.insertMany(sampleContent)

    return NextResponse.json({ 
      message: `Created ${createdContent.length} sample content items`,
      content: createdContent 
    })
  } catch (error) {
    console.error('Error seeding content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

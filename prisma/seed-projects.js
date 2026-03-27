'use strict';
// Run inside the container: node seed-projects.js
// Requires @prisma/client to be available in node_modules

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Ensure required categories exist
  const needed = ['AI', 'Web', 'Creative'];
  const cats = {};
  for (const name of needed) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    cats[name] = cat.id;
    console.log('Category ready:', name);
  }

  const projects = [
    {
      name: 'CampaignIQ',
      description:
        'AI agent that autonomously investigates iGaming campaign anomalies and reports.',
      longDescription:
        'CampaignIQ is an autonomous AI analytics agent built for iGaming performance teams. It connects to your data warehouse, detects drops in registrations, conversion rates, and deposits across markets, then runs a structured multi-step investigation — querying, analyzing, and generating actionable reports automatically. No dashboards to build. Just ask a question and get answers.',
      url: 'https://codere.rajuan.app',
      urlPublic: true,
      isPublic: true,
      tags: ['AI', 'Analytics', 'Python', 'iGaming', 'Autonomous'],
      categoryId: cats['AI'],
    },
    {
      name: 'CourseSync',
      description:
        'A private student dashboard for managing assignments, submissions, and course progress.',
      longDescription:
        'CourseSync is a full-stack web application built for university instructors to manage their courses end-to-end. It syncs student submissions directly from Google Forms and Sheets, tracks assignment completion per student and group, and provides a private admin interface for reviewing answers, sending messages, and managing student profiles. Students get their own dashboard to view assignments, lessons, resources, and communicate with the instructor — all in one place.',
      url: 'https://ai.withnadav.com',
      urlPublic: true,
      isPublic: true,
      tags: ['Web', 'Full-Stack', 'Education', 'React', 'Google Sheets'],
      categoryId: cats['Web'],
    },
    {
      name: 'EduMod',
      description: 'A smart panel for reviewing and curating educational trivia questions.',
      longDescription:
        'EduMod is a full-stack moderation dashboard built for reviewing image-based geometry questions across school grades. Moderators can browse questions in card or table view, filter by grade and status, and take actions — approve, skip, delete, or restore — with inline text editing and commenting. Built with Next.js, PostgreSQL, and deployed on AWS.',
      url: 'https://wizly.rajuan.app',
      urlPublic: true,
      isPublic: true,
      tags: ['Web', 'Next.js', 'PostgreSQL', 'Dashboard', 'AWS'],
      categoryId: cats['Web'],
    },
    {
      name: 'Rajuan',
      description: 'Personal project gallery with retro OS aesthetic and admin CMS.',
      longDescription:
        'A self-hosted project portfolio built with Next.js 14 and PostgreSQL, running on AWS EC2. Features a cyber retro-OS interface designed in Google Stitch — complete with bevel effects, scanline overlays, and a file-explorer admin panel. Projects support images, tags, categories, and granular visibility controls. Deployed via Docker and GitHub Actions.',
      url: 'https://rajuan.app',
      urlPublic: true,
      isPublic: true,
      tags: ['Next.js', 'TypeScript', 'AWS', 'Docker', 'PostgreSQL'],
      categoryId: cats['Web'],
    },
    {
      name: 'AeroPilot API',
      description:
        'An intelligent AI-powered API for orchestrating automated drone flight missions.',
      longDescription:
        'This project is an advanced backend service that translates natural language commands into actionable drone missions. Leveraging LLMs, it parses user intents to navigate, observe, or collect. It integrates with geocoding and routing services to automatically calculate safe, constraint-aware flight paths and coordinates multi-drone operations for complex aerial tasks.',
      url: 'https://flyz.rajuan.app',
      urlPublic: true,
      isPublic: true,
      tags: ['AI', 'Drones', 'LLM', 'API', 'Python'],
      categoryId: cats['AI'],
    },
    {
      name: 'Heybrain',
      description: 'AI-powered system that maps, understands, and expands human thinking.',
      longDescription:
        'HeyBrain is an AI-driven platform designed to explore and structure human thought processes. It helps users capture ideas, connect concepts, and expand them into deeper insights or outputs. By combining analysis, creativity, and interaction, it acts as a thinking partner that enhances clarity, discovery, and decision-making across different domains.',
      url: 'https://heybrain.ai',
      urlPublic: true,
      isPublic: true,
      tags: ['AI', 'Productivity', 'LLM', 'Knowledge'],
      categoryId: cats['AI'],
    },
    {
      name: 'AlwaysON',
      description:
        'A MAX/MSP listener patch from the sound card input sources which start recording automatically whenever a db threshold is being reached.',
      longDescription:
        'AlwaysON removes the pressure of hitting record by continuously capturing your creative flow. It lets you freely explore ideas, knowing every spontaneous moment is saved and accessible. Designed for creators, it ensures you can always return to unexpected insights, turning fleeting thoughts into usable content without interrupting the natural creative process.',
      url: 'https://github.com/AlwaysOn-Live/AlwaysON/',
      urlPublic: true,
      isPublic: true,
      tags: ['MAX/MSP', 'Audio', 'Creative', 'Recording'],
      categoryId: cats['Creative'],
    },
  ];

  for (const p of projects) {
    const existing = await prisma.project.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.project.update({ where: { id: existing.id }, data: p });
      console.log('Updated:', p.name);
    } else {
      await prisma.project.create({ data: p });
      console.log('Created:', p.name);
    }
  }

  console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

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
    {
      name: 'MeetMind',
      description: 'Your AI-powered meeting intelligence and action tracking assistant.',
      longDescription:
        'MeetMind automatically monitors your Google Drive for meeting recordings and transcripts, uses AI to generate structured summaries, extract key decisions, and identify action items. It sends follow-up email reports, executes tasks on your behalf, and gives you a smart chat interface to query any past meeting — turning every conversation into clear, trackable outcomes.',
      url: 'https://meeting-agent.rajuan.app',
      urlPublic: true,
      isPublic: true,
      tags: ['AI', 'Meetings', 'Automation', 'LLM', 'Google Drive'],
      categoryId: cats['AI'],
    },
    {
      name: 'FinTrack',
      description: 'Personal finance manager for Israeli bank accounts, invoices, and taxes.',
      longDescription:
        'FinTrack is a personal finance management platform built for Israeli freelancers and business owners. It aggregates bank transactions from Leumi and Mizrahi accounts, auto-categorizes expenses using smart tagging rules, and integrates with GreenInvoice for invoice matching and creation. The app provides profit and loss reports, credit card tracking, investment monitoring, and an AI-powered chatbot for financial insights. With a Hebrew RTL interface and full support for Israeli tax deduction logic, FinTrack turns raw bank data into clear, actionable financial visibility.',
      url: 'https://finapp.rajuan.app',
      urlPublic: true,
      isPublic: true,
      tags: ['Web', 'Finance', 'AI', 'Hebrew', 'Full-Stack'],
      categoryId: cats['Web'],
    },
    {
      name: 'Persona Memory',
      description: 'Chat with an AI persona built from your diary.',
      longDescription:
        'Persona Memory transforms your personal diary into a living, conversational memory. Upload your journal entries and watch an AI persona emerge — one that knows your history, relationships, emotional patterns, and evolving thoughts. Ask it anything about your past, explore recurring themes, and rediscover your story through intelligent, context-aware conversation.',
      url: 'https://persona-memory.rajuan.app',
      urlPublic: true,
      isPublic: true,
      tags: ['AI', 'LLM', 'Memory', 'Chat', 'Personal'],
      categoryId: cats['AI'],
    },
    {
      name: 'MarketingMachine',
      description: 'Autonomous marketing analytics agent that tracks, analyzes, and surfaces insights.',
      longDescription:
        'MarketingMachine is a full-stack autonomous agent that crawls your website, proposes event tracking schemas for PostHog and GA4, generates the tracking code, and optionally pushes it directly to Google Tag Manager — all with your approval at each step. It then runs an iterative analysis loop combining classical statistics and LLM reasoning to surface ranked findings: anomalies, rage clicks, funnel drop-offs, and segment divergences. Results appear in a clean dashboard and as live overlays in a Chrome extension, giving your team actionable insight without the manual instrumentation work.',
      url: 'https://marketing-machine.rajuan.app',
      urlPublic: true,
      isPublic: true,
      tags: ['AI', 'Analytics', 'Automation', 'LLM', 'Marketing'],
      categoryId: cats['AI'],
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

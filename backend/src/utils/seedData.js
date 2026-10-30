require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Counsellor = require('../models/Counsellor');
const InterviewSession = require('../models/InterviewSession');
const Appointment = require('../models/Appointment');
const BlockedDate = require('../models/BlockedDate');
const CalendlyIntegration = require('../models/CalendlyIntegration');
const Notification = require('../models/Notification');

// TrainDesk Models
const Person = require('../models/Person');
const Trainer = require('../models/Trainer');
const Trainee = require('../models/Trainee');
const TrainingSession = require('../models/TrainingSession');
const Booking = require('../models/Booking');

// SmartRoute Models & Services
const { Placement } = require('../models/Placement');
const Application = require('../models/Application');
const { generateQuestions } = require('../services/geminiQuestionService');
const { generateSessionQuizQuestionBank } = require('../services/sessionQuizQuestionBankService');

const POOL = [
  'Aarav Mehta', 'Ananya Rao', 'Rohit Sharma', 'Kavya Nair', 'Vikram Singh',
  'Sneha Patil', 'Arjun Reddy', 'Isha Gupta', 'Karthik Iyer', 'Meera Joshi',
  'Rahul Verma', 'Divya Menon', 'Aditya Kulkarni', 'Pooja Shetty', 'Siddharth Das',
  'Nisha Bhat', 'Manish Kumar', 'Riya Kapoor', 'Varun Hegde', 'Tanvi Desai',
  'Harsh Agarwal', 'Lakshmi Prasad', 'Deepak Naik', 'Shreya Banerjee', 'Yash Malhotra',
  'Anjali Pillai', 'Sanjay Gowda', 'Preeti Jain', 'Naveen Raj', 'Swati Bhandari'
];

const ORGS = [
  'RIT Bengaluru', 'Infosys', 'Wipro', 'TCS', 'Freelancer', 'BMS College', 'PES University', 'Accenture'
];

const TRAINERS_DATA = [
  {
    trainerId: 't1',
    name: 'Dr. Parkavi A.',
    specialization: 'System Design, AI/ML, Full Stack Architecture',
    email: 'parkavi.a@msrit.edu',
    phone: '+91 98450 12345'
  },
  {
    trainerId: 't2',
    name: 'Prof. Rajesh Kumar',
    specialization: 'Algorithms, Data Structures & Competitive Coding',
    email: 'rajesh.kumar@msrit.edu',
    phone: '+91 98765 43211'
  },
  {
    trainerId: 't3',
    name: 'Dr. Ananya Sharma',
    specialization: 'Cloud Computing, DevOps & Microservices',
    email: 'ananya.s@msrit.edu',
    phone: '+91 98765 43212'
  }
];

const RAW_SESSIONS = [
  ['t1', 0, 'System Design Fundamentals', '10:00', '12:00', 'Seminar Hall A', 25, 18, 0, 1],
  ['t1', 0, '1-on-1 Architecture Clinic', '13:30', '14:30', 'Conference Room 3', 8, 5, 0, 0],
  ['t1', 0, 'Microservices Patterns Workshop', '16:00', '17:30', 'Lab 2', 20, 20, 4, 0],
  ['t1', 1, 'Distributed Caching & Redis', '09:30', '11:00', 'Lab 2', 25, 20, 0, 2],
  ['t1', 2, 'Message Queues (Kafka & RabbitMQ)', '10:00', '12:00', 'Lab 1', 20, 16, 0, 0],
  ['t1', 2, 'API Gateway & Rate Limiting', '14:00', '16:00', 'Lab 1', 20, 12, 0, 1],
  ['t1', 4, 'Database Indexing & Query Tuning', '11:00', '13:00', 'Lab 3', 20, 14, 2, 0],
  ['t1', 5, 'Scalable Cloud Architecture', '14:00', '16:00', 'Seminar Hall A', 25, 23, 0, 0],
  ['t1', 5, 'Mock Technical Interview Panel', '15:30', '17:00', 'Room 5', 6, 6, 2, 0],
  ['t1', 6, 'Weekend High-Scale System Reviews', '10:00', '12:00', 'Room 5', 15, 9, 0, 0],
  ['t2', 0, 'Advanced Trees & Graphs in Practice', '11:00', '13:00', 'Lab 4', 20, 15, 0, 0],
  ['t2', 2, 'Dynamic Programming Masterclass', '10:00', '12:00', 'Lab 4', 20, 18, 0, 1],
  ['t2', 2, 'Greedy Algorithms & Shortest Path', '15:00', '17:00', 'Lab 4', 20, 14, 0, 0],
  ['t2', 3, 'LeetCode Hard Walkthrough', '14:00', '15:30', 'Room 2', 12, 9, 0, 0],
  ['t2', 4, 'Sorting & Binary Search Variations', '09:00', '11:00', 'Lab 2', 20, 20, 3, 0],
  ['t2', 5, 'Coding Round Simulation & Review', '13:00', '15:00', 'Lab 4', 20, 13, 0, 0],
  ['t3', 1, 'Docker Containerization Deep Dive', '10:00', '12:00', 'Lab 3', 25, 22, 2, 0],
  ['t3', 1, 'Kubernetes Pods & Ingress Controls', '14:00', '15:30', 'Lab 3', 20, 17, 0, 1],
  ['t3', 2, 'CI/CD Pipelines with GitHub Actions', '11:00', '13:00', 'Lab 3', 20, 15, 0, 0],
  ['t3', 3, 'Terraform & Infrastructure as Code', '10:00', '11:30', 'Lab 1', 15, 11, 0, 0],
  ['t3', 3, 'Cloud Security & IAM Best Practices', '15:00', '17:00', 'Seminar Hall B', 25, 19, 0, 0],
  ['t3', 5, 'Production Zero-Downtime Deployment', '10:00', '12:00', 'Lab 3', 20, 18, 0, 0]
];

const seedDatabase = async () => {
  try {
    const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_counselling_db';
    const mongoUri = rawUri.replace('localhost', '127.0.0.1');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at:', mongoUri);

    // Clear existing collections
    await User.deleteMany();
    await Student.deleteMany();
    await Counsellor.deleteMany();
    await InterviewSession.deleteMany();
    await Appointment.deleteMany();
    await BlockedDate.deleteMany();
    await CalendlyIntegration.deleteMany();
    await Notification.deleteMany();
    await Person.deleteMany();
    await TrainingSession.deleteMany();
    await Booking.deleteMany();
    await Placement.deleteMany();
    await Application.deleteMany();

    console.log('[Seed] Cleared old collections');

    // 1. Create Counsellor / Admin User (Dr. Parkavi A.)
    const counsellorUser = await User.create({
      name: 'Dr. Parkavi A.',
      email: 'parkavi.a@msrit.edu',
      password: 'Password123!',
      role: 'ADMIN',
      phone: '+91 98450 12345',
      avatar: '/dr-parkavi.jpg',
      bio: 'Dr. Parkavi A. is Professor in the Department of CSE(AI & ML) and CSE(CS) at Ramaiah Institute of Technology, Bengaluru. Her research interests include AI, ML, EDM, IoT, and AI-driven healthcare and agriculture. She has 21 years of teaching experience, 112 research publications, 14 book chapters, 3 granted and 15 published patents, and has guided 50+ student projects.'
    });

    // 2. Create Counsellor Profile
    await Counsellor.create({
      userId: counsellorUser._id,
      title: 'Professor | Dept of CSE(AI & ML) & CSE(CS)',
      headline: 'Professor at Ramaiah Institute of Technology, Bengaluru with 21+ Years of Teaching & Research Experience.',
      department: 'Department of CSE(AI & ML) and CSE(CS)',
      institution: 'Ramaiah Institute of Technology, Bengaluru',
      experienceYears: 21,
      companiesPast: ['Ramaiah Institute of Technology', 'Periyar Maniammai Institute', 'Anna University', 'IEEE'],
      expertiseAreas: [
        'Artificial Intelligence & Machine Learning',
        'Educational Data Mining & Learning Analytics',
        'Data Analytics & Predictive Analytics',
        'Deep Learning & Computer Vision',
        'System Design & Distributed Architecture'
      ],
      educationDetails: [
        { degree: 'Ph.D', year: '2018', university: 'Periyar Maniammai Institute of Science and Technology' },
        { degree: 'M.E', year: '2005', university: 'Anna University' },
        { degree: 'B.E', year: '2001', university: 'Bharathidasan University' }
      ],
      subjectsTaught: [
        'Block Chain Technology',
        'Data Structures',
        'Operating Systems',
        'Software Engineering',
        'Compiler Design'
      ],
      publicationsCount: 112,
      patentsCount: 18,
      hourlyRate: 0,
      rating: 4.99,
      totalReviews: 112,
      totalSessionsCompleted: 580,
      calendlyUserUri: 'https://api.calendly.com/users/USR_PARKAVI_A',
      calendlySchedulingUrl: 'https://calendly.com/interview-counsellor',
      googleCalendarEmail: 'parkavi.a@msrit.edu',
      googleCalendarSyncActive: true
    });

    // 3. Create Student Users
    const student1 = await User.create({
      name: 'Emily Watson',
      email: 'emily.watson@gmail.com',
      password: 'Password123!',
      role: 'STUDENT',
      phone: '+1 (555) 123-4567',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      bio: 'Computer Science student preparing for upcoming Tier-1 SWE placements and mock interviews.'
    });
    await Student.create({
      userId: student1._id,
      targetRoles: ['Software Engineer', 'Full Stack Developer'],
      targetCompanies: ['Google', 'Amazon', 'Microsoft'],
      education: 'B.Tech Computer Science, Ramaiah Institute of Technology',
      experienceLevel: 'STUDENT',
      preparationNotes: 'Focusing on dynamic programming, trees, and scalable distributed system design.'
    });

    const student2 = await User.create({
      name: 'David Chen',
      email: 'david.chen@gmail.com',
      password: 'Password123!',
      role: 'STUDENT',
      phone: '+1 (555) 987-6543',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Aspiring Backend Engineer preparing for campus placement drives and mock interviews.'
    });
    await Student.create({
      userId: student2._id,
      targetRoles: ['Backend Engineer', 'Systems Programmer'],
      targetCompanies: ['Meta', 'Uber', 'Atlassian'],
      education: 'B.Tech CSE',
      experienceLevel: 'STUDENT',
      preparationNotes: 'High-throughput system architecture and concurrency design.'
    });

    // 4. Create Interview Sessions (15-min and 30-min)
    const session15Values = {
      title: 'Quick Interview Counselling',
      duration: 15,
      sessionType: 'COUNSELLING',
      calendlyEventUrl: process.env.CALENDLY_15_MIN_URL || 'https://calendly.com/interview-counsellor/15-min-interview-counselling',
      status: 'ACTIVE',
      badge: 'Quick Strategy Session',
      displayOrder: 1,
      description: 'A focused 15-minute 1-on-1 strategy meeting designed to review immediate interview blockers, resume red-flags, and personalized company preparation advice.',
      features: [
        'Rapid resume & LinkedIn profile diagnosis',
        'Clarification on interview structure & expectations',
        'Targeted roadmap for DSA or System Design preparation',
        'Direct Q&A with professor and interview mentor'
      ]
    };
    session15Values.quizQuestionBank = await generateSessionQuizQuestionBank(session15Values);
    const session15 = await InterviewSession.create(session15Values);

    const session30Values = {
      title: 'Mock Interview & Training',
      duration: 30,
      sessionType: 'MOCK_INTERVIEW',
      calendlyEventUrl: process.env.CALENDLY_30_MIN_URL || 'https://calendly.com/interview-counsellor/30-min-mock-interview-training',
      status: 'ACTIVE',
      badge: 'Deep Simulation',
      displayOrder: 2,
      description: 'A comprehensive 30-minute realistic technical or behavioral mock interview simulation under actual FAANG conditions, followed by immediate actionable critique.',
      features: [
        'Live 20-min coding or system design problem scenario',
        'Evaluation on problem-solving, code quality & communication',
        '10-min live actionable debrief & scoring breakdown',
        'Official rubric feedback sheet sent to your student portal'
      ]
    };
    session30Values.quizQuestionBank = await generateSessionQuizQuestionBank(session30Values);
    const session30 = await InterviewSession.create(session30Values);

    // 5. Calendly Integration Configuration
    await CalendlyIntegration.create({
      counsellorId: counsellorUser._id,
      personalAccessToken: 'cal_pat_demo_token_parkavi_2026',
      organizationUri: 'https://api.calendly.com/organizations/ORG_PARKAVI_COUNSELLING',
      userUri: 'https://api.calendly.com/users/USR_PARKAVI_A',
      webhookSigningKey: 'calendly_whsec_sample_secret_key_2026',
      webhookSubscriptionUri: 'https://api.calendly.com/webhook_subscriptions/SUB_INTERVIEW_PORTAL',
      webhookCallbackUrl: 'http://localhost:5000/api/calendly/webhook',
      calendly15MinUrl: session15.calendlyEventUrl,
      calendly30MinUrl: session30.calendlyEventUrl,
      googleCalendarEmail: 'parkavi.a@msrit.edu',
      googleCalendarSyncStatus: 'CONNECTED',
      googleCalendarName: 'Dr. Parkavi A. (Primary Calendar)',
      lastWebhookReceivedAt: new Date(Date.now() - 3600000),
      lastWebhookEvent: 'invitee.created',
      isActive: true
    });

    // 6. Blocked Date
    await BlockedDate.create({
      date: '2026-11-20',
      reason: 'Academic Conference Keynote',
      createdBy: counsellorUser._id,
      syncMethod: 'DUAL_SYNC',
      calendlySyncStatus: 'ACTIVE_BLOCK',
      googleCalendarEventTitle: '[BLOCKED - COUNSELLOR UNAVAILABLE] Academic Conference Keynote',
      calendlyOverrideInstructions: 'Calendly checks Google Calendar for Busy events and automatically closes all appointment slots for 20 November 2026.'
    });

    // 7. Sample Appointments
    const appointment1 = await Appointment.create({
      studentId: student1._id,
      sessionId: session15._id,
      calendlyEventId: 'https://api.calendly.com/scheduled_events/EVT_SEED_001',
      calendlyInviteeId: 'https://api.calendly.com/scheduled_events/EVT_SEED_001/invitees/INV_SEED_001',
      date: '2026-11-15',
      startTime: '10:00 AM',
      endTime: '10:15 AM',
      duration: 15,
      status: 'SCHEDULED',
      studentName: student1.name,
      studentEmail: student1.email,
      sessionTitle: session15.title,
      sessionType: 'COUNSELLING',
      notes: 'Preparation strategy for upcoming campus placement technical rounds.',
      rescheduleUrl: '',
      cancelUrl: '',
      googleCalendarEventUrl: 'https://calendar.google.com/calendar'
    });

    // 8. Sample Notifications
    await Notification.create({
      userId: counsellorUser._id,
      title: 'New Booking via Calendly',
      message: 'Emily Watson booked Quick Interview Counselling for 2026-11-15 at 10:00 AM.',
      type: 'BOOKING_CREATED',
      appointmentId: appointment1._id
    });

    await Notification.create({
      userId: student1._id,
      title: 'Interview Session Confirmed!',
      message: 'Your 15-minute Quick Interview Counselling is booked for 2026-11-15 at 10:00 AM.',
      type: 'BOOKING_CREATED',
      appointmentId: appointment1._id
    });

    console.log('[Seed] Seeded Interview Booking core data.');

    // 9. Seed TrainDesk Trainers, Trainees, Sessions, Bookings
    const trainerDocs = await Trainer.insertMany(TRAINERS_DATA);
    const trainerMap = new Map();
    trainerDocs.forEach((t) => trainerMap.set(t.trainerId, t._id));

    const traineeDocsData = POOL.map((name, idx) => {
      const org = ORGS[idx % ORGS.length];
      const username = name.toLowerCase().replace(/\s+/g, '.');
      return {
        name,
        email: `${username}@${org.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        phone: `+91 ${9800000000 + idx * 11111}`,
        traineeId: `tr-${idx + 1}`,
        organization: org,
      };
    });
    const traineeDocs = await Trainee.insertMany(traineeDocsData);

    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const sessionsToInsert = [];
    const bookingsToInsert = [];

    for (let i = 0; i < RAW_SESSIONS.length; i++) {
      const [tId, off, topic, sTime, eTime, room, cap, conf, wait, canc] = RAW_SESSIONS[i];
      const trainerObjectId = trainerMap.get(tId);

      const sessionDate = new Date(baseDate);
      sessionDate.setDate(sessionDate.getDate() + off);

      const sessionMongoId = new mongoose.Types.ObjectId();
      const sessionId = `s${i}`;

      sessionsToInsert.push({
        _id: sessionMongoId,
        sessionId,
        trainerId: trainerObjectId,
        topic,
        date: sessionDate,
        startTime: sTime,
        endTime: eTime,
        room,
        capacity: cap,
      });

      let k = 0;
      const addStatusBookings = (count, status) => {
        for (let j = 0; j < count; j++, k++) {
          const traineeIndex = (i * 7 + k) % traineeDocs.length;
          const trainee = traineeDocs[traineeIndex];

          const bookingDate = new Date(baseDate);
          bookingDate.setDate(bookingDate.getDate() + off - ((k % 5) + 1));
          bookingDate.setHours(9 + ((k * 3) % 9), (k * 17) % 60, 0, 0);

          bookingsToInsert.push({
            bookingId: `bk-${i}-${k}`,
            sessionId: sessionMongoId,
            traineeId: trainee._id,
            bookedAt: bookingDate,
            status,
            notes: status === 'WAITLISTED' ? 'Pending seat release' : undefined,
          });
        }
      };

      addStatusBookings(conf, 'CONFIRMED');
      addStatusBookings(wait, 'WAITLISTED');
      addStatusBookings(canc, 'CANCELLED');
    }

    await TrainingSession.insertMany(sessionsToInsert);
    await Booking.insertMany(bookingsToInsert);
    console.log(`[Seed] Seeded TrainDesk: ${trainerDocs.length} trainers, ${sessionsToInsert.length} sessions, ${bookingsToInsert.length} bookings.`);

    // 10. Seed SmartRoute Placements & Applications
    const questionBankGoogle = await generateQuestions({
      title: 'Google SWE Campus Placement 2027',
      companyName: 'Google',
      description: 'Comprehensive campus placement recruitment drive for Software Engineer - Early Career roles. Focuses on data structures, algorithmic problem solving, and distributed systems.',
      location: 'Bengaluru / Hyderabad / Remote',
      domainMode: 'specific',
      domains: ['Data Structures', 'Algorithms', 'System Design'],
      questionCount: 5,
      difficulty: 'medium',
      randomnessPercent: 20,
    });

    const googlePlacement = await Placement.create({
      companyName: 'Google',
      title: 'Software Engineer - Campus Recruitment 2027',
      description: 'Join Google engineering teams building global-scale services. You will be evaluated on your core computer science fundamentals, data structures, algorithms, and system design aptitude.',
      location: 'Bengaluru, India',
      domainMode: 'specific',
      domains: ['Data Structures', 'Algorithms', 'System Design'],
      registrationOpensAt: new Date(Date.now() - 24 * 3600 * 1000), // opened yesterday
      registrationDeadline: new Date(Date.now() + 14 * 24 * 3600 * 1000), // 14 days later
      registrationLimit: 250,
      registrationCount: 1,
      questionCount: 5,
      questionPoolSize: questionBankGoogle.length,
      difficulty: 'medium',
      randomnessPercent: 20,
      questionBank: questionBankGoogle,
      createdBy: counsellorUser._id,
      status: 'published',
    });

    const questionBankAmazon = await generateQuestions({
      title: 'Amazon SDE-1 Assessment Drive',
      companyName: 'Amazon',
      description: 'Full-stack and backend software development engineer assessment covering DSA, OOP, DBMS, and REST APIs.',
      location: 'Bengaluru / Hyderabad',
      domainMode: 'random',
      domains: [],
      questionCount: 5,
      difficulty: 'easy',
      randomnessPercent: 25,
    });

    const amazonPlacement = await Placement.create({
      companyName: 'Amazon',
      title: 'Software Development Engineer I (SDE-1)',
      description: 'Assessment for Amazon SDE-1 campus hires. Topics include algorithms, object-oriented design, databases, and microservices.',
      location: 'Hyderabad, India',
      domainMode: 'random',
      domains: [],
      registrationOpensAt: new Date(Date.now() - 48 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() + 20 * 24 * 3600 * 1000),
      registrationLimit: 500,
      registrationCount: 0,
      questionCount: 5,
      questionPoolSize: questionBankAmazon.length,
      difficulty: 'easy',
      randomnessPercent: 25,
      questionBank: questionBankAmazon,
      createdBy: counsellorUser._id,
      status: 'published',
    });

    // Create a sample registered application for Emily Watson in Google Placement
    await Application.create({
      placement: googlePlacement._id,
      candidate: student1._id,
      status: 'registered',
      registeredAt: new Date(),
      score: 0,
    });

    console.log('[Seed] Seeded SmartRoute: Placements & Candidate Applications.');

    console.log('[Seed] ✅ ALL THREE PLATFORMS SEEDED SUCCESSFULLY INTO ONE UNIFIED DATABASE!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDatabase();

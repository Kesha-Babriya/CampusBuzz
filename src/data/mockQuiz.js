export const quizQuestions = [
  {
    id: 1,
    question: "When you open your laptop on a free Saturday morning, what are you most drawn to doing?",
    category: "Natural Curiosity",
    options: [
      {
        text: "Tackling tricky algorithmic puzzles or grinding LeetCode / Codeforces problems.",
        weights: { "vimarsh": 5, "dev-infinity": 2, "robotics-club": 1, "finance-entrepreneurship": 1, "cultural-club": 0 }
      },
      {
        text: "Building an app, redesigning a landing page, or tinkering with a full-stack web project.",
        weights: { "dev-infinity": 5, "vimarsh": 1, "robotics-club": 1, "finance-entrepreneurship": 2, "cultural-club": 0 }
      },
      {
        text: "Writing music, jamming on an instrument, practicing theatre, or planning a campus social.",
        weights: { "cultural-club": 5, "finance-entrepreneurship": 1, "dev-infinity": 0, "vimarsh": 0, "robotics-club": 0 }
      },
      {
        text: "Soldering microcontroller circuits, tuning motors, or programming Arduino / Raspberry Pi boards.",
        weights: { "robotics-club": 5, "dev-infinity": 2, "vimarsh": 1, "cultural-club": 0, "finance-entrepreneurship": 0 }
      },
      {
        text: "Reading startup breakdowns, tracking market indices, or drafting pitch decks and business models.",
        weights: { "finance-entrepreneurship": 5, "dev-infinity": 1, "cultural-club": 1, "vimarsh": 0, "robotics-club": 0 }
      }
    ]
  },
  {
    id: 2,
    question: "What kind of achievement gives you the biggest rush of adrenaline?",
    category: "Reward Drivers",
    options: [
      {
        text: "Seeing a Green 'Accepted' verdict on a hard dynamic programming or graph problem.",
        weights: { "vimarsh": 5, "dev-infinity": 2, "robotics-club": 1, "finance-entrepreneurship": 0, "cultural-club": 0 }
      },
      {
        text: "Deploying a live web app to production and sharing a working URL with hundreds of peers.",
        weights: { "dev-infinity": 5, "vimarsh": 1, "finance-entrepreneurship": 2, "robotics-club": 1, "cultural-club": 0 }
      },
      {
        text: "Hearing the entire auditorium erupt in applause after an electrifying performance.",
        weights: { "cultural-club": 5, "finance-entrepreneurship": 1, "dev-infinity": 0, "vimarsh": 0, "robotics-club": 0 }
      },
      {
        text: "Watching a physical robot navigate an obstacle course autonomously without crashing.",
        weights: { "robotics-club": 5, "dev-infinity": 2, "vimarsh": 1, "cultural-club": 0, "finance-entrepreneurship": 0 }
      },
      {
        text: "Convincing a panel of judges that your business model is commercially viable and scalable.",
        weights: { "finance-entrepreneurship": 5, "cultural-club": 1, "dev-infinity": 1, "vimarsh": 0, "robotics-club": 0 }
      }
    ]
  },
  {
    id: 3,
    question: "Which toolkit or environment would you enjoy mastering the most?",
    category: "Technical Stacks",
    options: [
      {
        text: "C++, STL, Segment Trees, Disjoint Set Union, and time/space complexity proofs.",
        weights: { "vimarsh": 5, "robotics-club": 2, "dev-infinity": 1, "finance-entrepreneurship": 0, "cultural-club": 0 }
      },
      {
        text: "React, Next.js, Node.js, Tailwind CSS, PostgreSQL, and Git version control.",
        weights: { "dev-infinity": 5, "finance-entrepreneurship": 1, "vimarsh": 1, "robotics-club": 1, "cultural-club": 0 }
      },
      {
        text: "Acoustic instruments, stage lighting, vocal harmony, or creative scriptwriting.",
        weights: { "cultural-club": 5, "finance-entrepreneurship": 0, "dev-infinity": 0, "vimarsh": 0, "robotics-club": 0 }
      },
      {
        text: "ESP32, ROS, OpenCV, brushless motor drivers, sensors, and 3D printing CAD models.",
        weights: { "robotics-club": 5, "vimarsh": 1, "dev-infinity": 2, "finance-entrepreneurship": 0, "cultural-club": 0 }
      },
      {
        text: "Excel financial modeling, cap tables, valuation spreadsheets, and pitch presentations.",
        weights: { "finance-entrepreneurship": 5, "dev-infinity": 1, "cultural-club": 1, "vimarsh": 0, "robotics-club": 0 }
      }
    ]
  },
  {
    id: 4,
    question: "What type of campus event are you most eager to participate in?",
    category: "Event Preferences",
    options: [
      {
        text: "An ICPC-style timed coding marathon with live ranklists and mathematical challenges.",
        weights: { "vimarsh": 5, "dev-infinity": 2, "robotics-club": 1, "finance-entrepreneurship": 0, "cultural-club": 0 }
      },
      {
        text: "A 36-hour weekend hackathon building working prototypes with team members.",
        weights: { "dev-infinity": 5, "vimarsh": 2, "robotics-club": 2, "finance-entrepreneurship": 2, "cultural-club": 0 }
      },
      {
        text: "Annual cultural fest, amphitheatre open mic, Garba nights, or musical jams.",
        weights: { "cultural-club": 5, "finance-entrepreneurship": 1, "dev-infinity": 0, "vimarsh": 0, "robotics-club": 0 }
      },
      {
        text: "A RoboCombat arena tournament or an autonomous line-follower speed race.",
        weights: { "robotics-club": 5, "vimarsh": 1, "dev-infinity": 1, "finance-entrepreneurship": 0, "cultural-club": 0 }
      },
      {
        text: "A Shark-Tank style pitch competition, venture case study, or trading simulation.",
        weights: { "finance-entrepreneurship": 5, "cultural-club": 1, "dev-infinity": 1, "vimarsh": 0, "robotics-club": 0 }
      }
    ]
  },
  {
    id: 5,
    question: "In your dream career after graduation, what role appeals to you most?",
    category: "Career Vision",
    options: [
      {
        text: "High-frequency quantitative developer or core algorithmic engineer at top tech firms.",
        weights: { "vimarsh": 5, "finance-entrepreneurship": 3, "dev-infinity": 2, "robotics-club": 1, "cultural-club": 0 }
      },
      {
        text: "Software engineer, full-stack product architect, or open-source contributor.",
        weights: { "dev-infinity": 5, "vimarsh": 2, "finance-entrepreneurship": 1, "robotics-club": 1, "cultural-club": 0 }
      },
      {
        text: "Creative artist, creative director, performer, or community festival organizer.",
        weights: { "cultural-club": 5, "finance-entrepreneurship": 1, "dev-infinity": 0, "vimarsh": 0, "robotics-club": 0 }
      },
      {
        text: "Robotics engineer, embedded systems developer, autonomous vehicles specialist.",
        weights: { "robotics-club": 5, "dev-infinity": 2, "vimarsh": 2, "finance-entrepreneurship": 0, "cultural-club": 0 }
      },
      {
        text: "Startup founder, venture capitalist, product manager, or investment banker.",
        weights: { "finance-entrepreneurship": 5, "dev-infinity": 2, "cultural-club": 1, "vimarsh": 0, "robotics-club": 0 }
      }
    ]
  },
  {
    id: 6,
    question: "How do you prefer collaborating with fellow engineering students?",
    category: "Team Dynamics",
    options: [
      {
        text: "Pair programming, whiteboarding edge-case proofs, and sharing editorial solutions.",
        weights: { "vimarsh": 5, "dev-infinity": 2, "robotics-club": 1, "finance-entrepreneurship": 0, "cultural-club": 0 }
      },
      {
        text: "Agile sprints, reviewing GitHub pull requests, and building modular software layers.",
        weights: { "dev-infinity": 5, "finance-entrepreneurship": 1, "vimarsh": 1, "robotics-club": 1, "cultural-club": 0 }
      },
      {
        text: "Ensemble rehearsals, improvisations, and brainstorming themes for student galas.",
        weights: { "cultural-club": 5, "finance-entrepreneurship": 1, "dev-infinity": 0, "vimarsh": 0, "robotics-club": 0 }
      },
      {
        text: "Gathering around a workbench with screwdrivers, oscilloscopes, and breadboards.",
        weights: { "robotics-club": 5, "dev-infinity": 2, "vimarsh": 1, "cultural-club": 0, "finance-entrepreneurship": 0 }
      },
      {
        text: "Discussing market trends, testing business hypotheses, and practicing pitch decks.",
        weights: { "finance-entrepreneurship": 5, "cultural-club": 1, "dev-infinity": 2, "vimarsh": 0, "robotics-club": 0 }
      }
    ]
  },
  {
    id: 7,
    question: "When faced with an unfamiliar problem, what is your intuitive first reflex?",
    category: "Problem Solving Instinct",
    options: [
      {
        text: "Break it down into mathematical invariants, recursive subproblems, and optimal bounds.",
        weights: { "vimarsh": 5, "finance-entrepreneurship": 1, "dev-infinity": 2, "robotics-club": 1, "cultural-club": 0 }
      },
      {
        text: "Quickly spin up a prototype or search documentation to see how existing libraries solve it.",
        weights: { "dev-infinity": 5, "robotics-club": 2, "vimarsh": 1, "finance-entrepreneurship": 1, "cultural-club": 0 }
      },
      {
        text: "Think about the human emotion, storytelling, and audience engagement aspect.",
        weights: { "cultural-club": 5, "finance-entrepreneurship": 2, "dev-infinity": 0, "vimarsh": 0, "robotics-club": 0 }
      },
      {
        text: "Inspect physical constraints, power draws, serial telemetry, and mechanical linkages.",
        weights: { "robotics-club": 5, "dev-infinity": 2, "vimarsh": 1, "finance-entrepreneurship": 0, "cultural-club": 0 }
      },
      {
        text: "Analyze who the customer is, what value is created, and if the economics make sense.",
        weights: { "finance-entrepreneurship": 5, "dev-infinity": 2, "cultural-club": 1, "vimarsh": 0, "robotics-club": 0 }
      }
    ]
  }
];

export function calculateQuizResults(answers, clubs = [], customQuestions = null) {
  // answers: { [questionId]: selectedOptionIndex }
  const scores = {
    "vimarsh": 0,
    "dev-infinity": 0,
    "cultural-club": 0,
    "robotics-club": 0,
    "finance-entrepreneurship": 0
  };

  const maxPossibleScores = {
    "vimarsh": 0,
    "dev-infinity": 0,
    "cultural-club": 0,
    "robotics-club": 0,
    "finance-entrepreneurship": 0
  };

  const activeQuestions = (customQuestions && customQuestions.length > 0) ? customQuestions : quizQuestions;

  activeQuestions.forEach(q => {
    // calculate max possible for normalization
    let maxForClub = { "vimarsh": 0, "dev-infinity": 0, "cultural-club": 0, "robotics-club": 0, "finance-entrepreneurship": 0 };
    (q.options || []).forEach(opt => {
      Object.keys(opt.weights || {}).forEach(clubId => {
        if ((opt.weights[clubId] || 0) > maxForClub[clubId]) {
          maxForClub[clubId] = opt.weights[clubId];
        }
      });
    });
    Object.keys(maxForClub).forEach(clubId => {
      maxPossibleScores[clubId] += maxForClub[clubId];
    });

    // add selected score
    const selectedIdx = answers[q.id];
    if (selectedIdx !== undefined && q.options && q.options[selectedIdx]) {
      const selectedOpt = q.options[selectedIdx];
      Object.entries(selectedOpt.weights || {}).forEach(([clubId, weight]) => {
        if (scores[clubId] !== undefined) {
          scores[clubId] += weight;
        }
      });
    }
  });

  // Calculate percentages
  const ranked = Object.keys(scores).map(clubId => {
    const raw = scores[clubId];
    const max = maxPossibleScores[clubId] || 25;
    const percentage = Math.min(99, Math.max(15, Math.round((raw / (max || 1)) * 100)));
    const clubInfo = clubs.find(c => c.id === clubId || c.slug === clubId) || {
      id: clubId,
      name: clubId.toUpperCase(),
      category: 'Student Club',
      domain: 'Engineering',
      logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150'
    };

    return {
      clubId,
      rawScore: raw,
      percentage,
      club: clubInfo,
      rationale: getMatchRationale(clubId, percentage)
    };
  });

  // Sort descending
  ranked.sort((a, b) => b.percentage - a.percentage);

  return ranked;
}

function getMatchRationale(clubId, percentage) {
  switch (clubId) {
    case "vimarsh":
      return "Your analytical approach, passion for algorithmic efficiency, and fascination with mathematical edge cases make VIMARSH your natural arena.";
    case "dev-infinity":
      return "Your drive to ship real products, master modern web technologies, and build impactful tools directly mirrors the philosophy of Dev Infinity.";
    case "cultural-club":
      return "Your creative energy, love for performing arts, and desire to enrich campus life beyond syntax errors makes the Cultural Club your stage.";
    case "robotics-club":
      return "Your interest in tactile hardware, microcontrollers, embedded firmware, and autonomous mechanics is a perfect fit for the Robotics Club.";
    case "finance-entrepreneurship":
      return "Your entrepreneurial mindset, commercial perspective, and interest in startup dynamics align seamlessly with the Finance & Entrepreneurship Club.";
    default:
      return "A well-balanced match based on your preferences.";
  }
}

import { register } from './auth.mjs';
import { dbReady, createOwner, createHorse, getAllOwners } from './database.mjs';

async function seed() {
  try {
    await dbReady;
    console.log('Database ready, creating admin user...');

    await register('admin@stable.com', 'admin123', 'Admin User', 'admin');

    console.log('✓ Admin user created successfully');
    console.log('  Email: admin@stable.com');
    console.log('  Password: admin123');

    // Create demo owner
    console.log('\nCreating demo owner...');
    let ownerId;
    try {
      const owner = await createOwner({
        first_name: 'Sarah',
        last_name: 'Thompson',
        email: 'sarah.thompson@example.com',
        phone: '+1-555-0123',
        address: '456 Equestrian Lane, Horse Valley, CA 94102',
        emergency_contact: 'John Thompson (Husband) - +1-555-0124'
      });
      ownerId = owner.id;
      console.log('✓ Demo owner created');
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        console.log('Demo owner already exists, fetching...');
        const owners = await getAllOwners();
        const existingOwner = owners.find(o => o.email === 'sarah.thompson@example.com');
        if (existingOwner) {
          ownerId = existingOwner.id;
        }
      } else {
        throw err;
      }
    }

    // Create demo horse with comprehensive details
    if (ownerId) {
      console.log('Creating demo horse with comprehensive details...');
      try {
        await createHorse({
          name: 'Midnight Star',
          pet_name: 'Misty',
          breed: 'Thoroughbred',
          gender: 'mare',
          colour: 'Black',
          height: 16.2,
          age: 8,
          clipped: true,
          fei_id: 'FEI10012345',
          passport_number: 'GB123456789',
          rfid: '985112345678901',
          rug_name: 'Star',
          owner_id: ownerId,

          // Diet
          dietary_requirements: `Morning Feed: 2 scoops grain mix with joint supplement
Midday: Hay net (approx 3kg)
Evening Feed: 2 scoops grain mix with vitamin E
Allergies: None known
Notes: Prefers timothy hay over alfalfa. Increase feed on training days.`,

          // Pedigree
          sire: 'Northern Dancer II',
          dam: 'Starlight Express',
          bloodline_info: `Sire's Line: Northern Dancer II by Storm Cat
Dam's Line: Starlight Express by Seattle Slew
Notable Relatives: Full brother to "Champion's Glory" (Grade 1 winner)
Bloodline known for exceptional jumping ability and temperament`,

          // Breeding
          breeding_status: 'available',
          breeding_notes: `Last foaled: 2021 (healthy colt by Galileo Gold)
Breeding History: 3 successful pregnancies, all healthy foals
Fertility: Excellent
Temperament when in foal: Calm and easy to handle
Available for breeding season 2024
Stud fee negotiable for proven bloodlines`,

          // Inquiry
          inquiry_notes: `March 15, 2024 - Inquiry from John Martinez regarding purchase for daughter's competition training. Budget: $150,000. Status: Under consideration.

February 2, 2024 - Interest shown by Green Valley Stables for lease arrangement. 6-month lease with option to purchase. Status: Declined.

January 10, 2024 - Inquiry about breeding services from Oakwood Farm. Status: Completed - foal due Spring 2025.`,

          // Performance
          competition_record: `2024 Season:
- Wellington Classic - 1st Place (Grand Prix)
- Devon Horse Show - 2nd Place (Open Jumpers)
- Hampton Classic - 1st Place (1.40m Jumpers)

2023 Season:
- World Equestrian Games Qualifier - 3rd Place
- International Jumping Competition - 1st Place
- Regional Championships - 1st Place (Team Competition)

Career Earnings: $285,000
Total Starts: 47 | Wins: 23 | Places: 38`,

          training_notes: `Current Training Level: Advanced Grand Prix (1.50m-1.60m)
Discipline: Show Jumping
Trainer: Emma Rodriguez, Certified FEI Trainer

Training Schedule:
- Monday: Flatwork and dressage (45 min)
- Tuesday: Jumping grid work (1 hour)
- Wednesday: Light hack/trail ride
- Thursday: Course work (1.5 hours)
- Friday: Flatwork and gymnastics
- Weekend: Competition or rest

Notes: Excellent left lead changes. Working on tighter turns in jump-offs. Very brave and scopey. Perfect for amateur owner rider.`,

          // Media
          photo_url: 'https://images.pexels.com/photos/1996338/pexels-photo-1996338.jpeg',
          video_urls: `https://example.com/videos/midnight-star-training-2024-01.mp4
https://example.com/videos/midnight-star-wellington-classic.mp4
https://example.com/videos/midnight-star-flatwork-session.mp4
https://youtube.com/watch?v=example-jump-round`,

          // Links
          related_links: `https://example.com/docs/midnight-star-registration.pdf
https://example.com/docs/health-records-2024.pdf
https://example.com/docs/competition-results.pdf
https://horsetelex.com/horses/view/midnight-star
https://fei.org/athlete/horse/12345
https://example.com/docs/breeding-records.pdf
https://example.com/docs/xray-repository.pdf`,

          status: 'active'
        });
        console.log('✓ Demo horse created with comprehensive details');
      } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          console.log('Demo horse already exists. Skipping.');
        } else {
          throw err;
        }
      }
    }

    console.log('\n✓ Seeding completed successfully!');
    console.log('\nYou can now login with these credentials.');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Admin user already exists. Skipping seed.');
      process.exit(0);
    } else {
      console.error('Error seeding database:', error);
      process.exit(1);
    }
  }
}

seed();

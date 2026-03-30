import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("demo1234", 10);

  // Create demo users
  const sarah = await prisma.user.upsert({
    where: { email: "dogparent@demo.com" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "dogparent@demo.com",
      passwordHash: hash,
      bio: "Dog mom to two rescue pups. Love finding new patios and parks!",
      city: "Austin",
      latitude: 30.2672,
      longitude: -97.7431,
    },
  });

  const mike = await prisma.user.upsert({
    where: { email: "mike@demo.com" },
    update: {},
    create: {
      name: "Mike Chen",
      email: "mike@demo.com",
      passwordHash: hash,
      bio: "Weekend explorer with my golden retriever.",
      city: "Austin",
      latitude: 30.2849,
      longitude: -97.7341,
    },
  });

  const lisa = await prisma.user.upsert({
    where: { email: "lisa@demo.com" },
    update: {},
    create: {
      name: "Lisa Park",
      email: "lisa@demo.com",
      passwordHash: hash,
      bio: "Small dog enthusiast. Chihuahua mom.",
      city: "Austin",
      latitude: 30.2500,
      longitude: -97.7500,
    },
  });

  // Create dogs
  const buddy = await prisma.dog.create({
    data: { name: "Buddy", breed: "Golden Retriever", age: 3, size: "LARGE", weight: 72, bio: "Loves belly rubs and swimming!", ownerId: sarah.id },
  });

  const luna = await prisma.dog.create({
    data: { name: "Luna", breed: "Labrador Mix", age: 2, size: "MEDIUM", weight: 45, bio: "Rescue pup who loves making friends at the park.", ownerId: sarah.id },
  });

  const max = await prisma.dog.create({
    data: { name: "Max", breed: "Golden Retriever", age: 4, size: "LARGE", weight: 80, bio: "Tennis ball obsessed. Friendly to all dogs and humans.", ownerId: mike.id },
  });

  const coco = await prisma.dog.create({
    data: { name: "Coco", breed: "Chihuahua", age: 5, size: "SMALL", weight: 6, bio: "Tiny but fierce! Loves patio dining.", ownerId: lisa.id },
  });

  // Create friend connections
  await prisma.friendRequest.create({
    data: { fromDogId: buddy.id, toDogId: max.id, status: "ACCEPTED" },
  });
  await prisma.friendRequest.create({
    data: { fromDogId: luna.id, toDogId: coco.id, status: "ACCEPTED" },
  });
  await prisma.friendRequest.create({
    data: { fromDogId: max.id, toDogId: luna.id, status: "PENDING" },
  });

  // Create places
  const zilker = await prisma.place.create({
    data: {
      name: "Zilker Park Off-Leash Area",
      type: "DOG_PARK",
      address: "2100 Barton Springs Rd",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      latitude: 30.2669,
      longitude: -97.7729,
      description: "Huge off-leash area near Barton Springs. Dogs love the creek access and wide open fields.",
      addedById: sarah.id,
      hasWater: true,
      hasWasteStations: true,
      isOffLeashOk: true,
      hasFencedArea: false,
      hasParking: true,
    },
  });

  const lazyDog = await prisma.place.create({
    data: {
      name: "Lazy Dog Restaurant & Bar",
      type: "RESTAURANT",
      address: "111 W 5th St",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      latitude: 30.2674,
      longitude: -97.7441,
      description: "Dog-friendly patio with a special dog menu! They bring water bowls to your table.",
      addedById: mike.id,
      hasWater: true,
      hasFreeTreats: true,
      patioFriendly: true,
      canComeInside: false,
      hasDogMenu: true,
      hasParking: true,
    },
  });

  const barkPark = await prisma.place.create({
    data: {
      name: "Red Bud Isle Dog Park",
      type: "DOG_PARK",
      address: "3401 Redbud Trail",
      city: "Austin",
      state: "TX",
      zipCode: "78746",
      latitude: 30.2890,
      longitude: -97.7833,
      description: "Island park surrounded by water. Off-leash paradise for water-loving dogs.",
      addedById: sarah.id,
      hasWater: true,
      hasWasteStations: true,
      isOffLeashOk: true,
      hasParking: true,
    },
  });

  const mozarts = await prisma.place.create({
    data: {
      name: "Mozart's Coffee Roasters",
      type: "CAFE",
      address: "3825 Lake Austin Blvd",
      city: "Austin",
      state: "TX",
      zipCode: "78703",
      latitude: 30.2906,
      longitude: -97.7884,
      description: "Lakeside coffee shop with a huge dog-friendly patio overlooking Lake Austin.",
      addedById: lisa.id,
      hasWater: true,
      patioFriendly: true,
      canComeInside: false,
      hasParking: true,
    },
  });

  const tomlinson = await prisma.place.create({
    data: {
      name: "Tomlinson's Feed & Pets",
      type: "PET_STORE",
      address: "9607 Research Blvd",
      city: "Austin",
      state: "TX",
      zipCode: "78759",
      latitude: 30.3870,
      longitude: -97.7430,
      description: "Local pet store that welcomes dogs inside! Free treats at the counter.",
      addedById: mike.id,
      hasWater: true,
      hasFreeTreats: true,
      canComeInside: true,
      hasParking: true,
    },
  });

  const brewDog = await prisma.place.create({
    data: {
      name: "Yard Bar",
      type: "BREWERY",
      address: "6700 Burnet Rd",
      city: "Austin",
      state: "TX",
      zipCode: "78757",
      latitude: 30.3375,
      longitude: -97.7393,
      description: "Bar + dog park combo! Fenced off-leash area with beer on tap. Dog heaven.",
      addedById: sarah.id,
      hasWater: true,
      hasFreeTreats: false,
      patioFriendly: true,
      isOffLeashOk: true,
      hasFencedArea: true,
      hasParking: true,
    },
  });

  const lakeTrail = await prisma.place.create({
    data: {
      name: "Lady Bird Lake Trail",
      type: "TRAIL",
      address: "1 S Lakeshore Blvd",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      latitude: 30.2614,
      longitude: -97.7452,
      description: "10-mile hike and bike trail around the lake. Dogs must be leashed but love the scenery.",
      addedById: lisa.id,
      hasWater: false,
      hasWasteStations: true,
      hasParking: true,
    },
  });

  const vca = await prisma.place.create({
    data: {
      name: "VCA Animal Hospital",
      type: "VET",
      address: "4300 S Lamar Blvd",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      latitude: 30.2370,
      longitude: -97.7897,
      description: "Great vet clinic. Gentle with nervous dogs and always have treats.",
      addedById: mike.id,
      hasWater: true,
      hasFreeTreats: true,
      canComeInside: true,
      hasParking: true,
    },
  });

  // Create reviews
  await prisma.review.create({
    data: {
      placeId: zilker.id,
      userId: sarah.id,
      overallRating: 5,
      cleanliness: 4,
      dogFriendliness: 5,
      dogParentRating: 4,
      safetyRating: 4,
      spaceRating: 5,
      comment: "Buddy absolutely loves this place! Huge open area and access to the creek. Gets a bit crowded on weekends but overall amazing.",
      votedHasWater: true,
    },
  });

  await prisma.review.create({
    data: {
      placeId: zilker.id,
      userId: mike.id,
      overallRating: 4,
      cleanliness: 3,
      dogFriendliness: 5,
      dogParentRating: 3,
      safetyRating: 3,
      spaceRating: 5,
      comment: "Max goes crazy here. Lots of room to run. Some owners don't pick up after their dogs though. Could be cleaner.",
      votedHasWater: true,
    },
  });

  await prisma.review.create({
    data: {
      placeId: lazyDog.id,
      userId: sarah.id,
      overallRating: 5,
      staffFriendliness: 5,
      dogFriendliness: 5,
      treatsQuality: 5,
      waterAvailability: 5,
      safetyRating: 5,
      comment: "Luna got her own grilled chicken from the dog menu! Staff was incredibly welcoming. They pet every dog that comes in.",
      votedHasWater: true,
      votedHasFreeTreats: true,
      votedPatioFriendly: true,
    },
  });

  await prisma.review.create({
    data: {
      placeId: lazyDog.id,
      userId: lisa.id,
      overallRating: 4,
      staffFriendliness: 5,
      dogFriendliness: 4,
      treatsQuality: 4,
      waterAvailability: 5,
      comment: "Coco loved the patio! Great water bowls at every table. A bit loud for small nervous dogs but overall pawsome!",
      votedPatioFriendly: true,
      votedCanComeInside: false,
    },
  });

  await prisma.review.create({
    data: {
      placeId: barkPark.id,
      userId: mike.id,
      overallRating: 5,
      cleanliness: 4,
      dogFriendliness: 5,
      dogParentRating: 4,
      safetyRating: 3,
      spaceRating: 5,
      comment: "Max's favorite spot in Austin! He swims for hours. Be careful near the deeper water areas but otherwise incredible.",
    },
  });

  await prisma.review.create({
    data: {
      placeId: mozarts.id,
      userId: lisa.id,
      overallRating: 4,
      staffFriendliness: 4,
      waterAvailability: 4,
      spaceRating: 4,
      comment: "Beautiful lake views from the patio. Coco loves people-watching here. They bring water without asking!",
      votedPatioFriendly: true,
    },
  });

  await prisma.review.create({
    data: {
      placeId: tomlinson.id,
      userId: sarah.id,
      overallRating: 5,
      staffFriendliness: 5,
      treatsQuality: 5,
      comment: "Both my dogs go crazy when we pull into the parking lot. Free treats at the register and the staff knows them by name!",
      votedHasFreeTreats: true,
      votedCanComeInside: true,
    },
  });

  await prisma.review.create({
    data: {
      placeId: brewDog.id,
      userId: mike.id,
      overallRating: 5,
      dogFriendliness: 5,
      safetyRating: 5,
      spaceRating: 5,
      comment: "Beer AND a dog park? This is the best concept ever. Max plays while I enjoy a cold one. Fully fenced too!",
      votedPatioFriendly: true,
    },
  });

  await prisma.review.create({
    data: {
      placeId: brewDog.id,
      userId: lisa.id,
      overallRating: 3,
      dogFriendliness: 3,
      safetyRating: 3,
      spaceRating: 4,
      comment: "Fun concept but Coco is too small for the big dog area. They have a small dog section but it's pretty bare. Better for bigger dogs.",
    },
  });

  await prisma.review.create({
    data: {
      placeId: vca.id,
      userId: lisa.id,
      overallRating: 4,
      staffFriendliness: 5,
      treatsQuality: 4,
      safetyRating: 5,
      comment: "Coco hates the vet but they make it as painless as possible. Treats galore and very gentle with small dogs.",
      votedHasFreeTreats: true,
    },
  });

  console.log("🐾 RRRuff seed data created successfully!");
  console.log("   Demo login: dogparent@demo.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

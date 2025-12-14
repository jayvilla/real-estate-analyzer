import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import { PropertyService } from '../property/property.service';
import { DealService } from '../deal/deal.service';
import {
  PropertyType,
  LoanType,
  DealStatus,
} from '@real-estate-analyzer/types';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UserService);
  const organizationService = app.get(OrganizationService);
  const propertyService = await app.resolve(PropertyService);
  const dealService = await app.resolve(DealService);

  try {
    console.log('🌱 Starting database seed...\n');

    // Check if user already exists
    let existingUser = await userService.findByEmail('test@example.com');
    let organization;
    let user;
    let existingProperties;

    if (existingUser) {
      console.log(
        'ℹ️  Test user already exists. Using existing user and organization.'
      );
      user = existingUser;
      organization = {
        id: user.organizationId,
        name: 'My Real Estate Company',
      };

      // Check if we already have a full portfolio (15+ properties)
      existingProperties = await propertyService.findAll(user.organizationId);
      if (existingProperties.length >= 15) {
        console.log(
          `⚠️  Portfolio already has ${existingProperties.length} properties. Skipping seed.`
        );
        console.log('   To re-seed, delete properties first or run db:reset');
        await app.close();
        process.exit(0);
      } else {
        console.log(
          `ℹ️  Found ${existingProperties.length} existing properties. Will add more to reach 15.\n`
        );
      }
    } else {
      // 1. Create organization
      console.log('📦 Creating organization...');
      organization = await organizationService.create('My Real Estate Company');
      console.log(
        `✅ Organization created: ${organization.name} (${organization.id})\n`
      );

      // 2. Create user
      console.log('👤 Creating test user...');
      user = await userService.create(
        'test@example.com',
        'password123',
        'test',
        'user',
        organization.id
      );
      console.log(`✅ User created: ${user.email} (${user.id})\n`);
      // Get existing properties (should be empty for new user)
      existingProperties = await propertyService.findAll(user.organizationId);
    }

    // 3. Get existing properties to avoid duplicates
    const existingAddresses = new Set(
      (existingProperties || []).map((p) => `${p.address}-${p.city}-${p.state}`)
    );

    // 3. Create diverse portfolio of properties
    console.log('🏠 Creating portfolio properties...');
    const properties = [
      // California Properties
      {
        address: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        propertyType: PropertyType.SINGLE_FAMILY,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1500,
        lotSize: 5000,
        yearBuilt: 2020,
        purchasePrice: 500000,
      },
      {
        address: '456 Oak Avenue',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        propertyType: PropertyType.CONDO,
        bedrooms: 2,
        bathrooms: 1,
        squareFeet: 1000,
        yearBuilt: 2015,
        purchasePrice: 750000,
      },
      {
        address: '789 Pine Road',
        city: 'San Diego',
        state: 'CA',
        zipCode: '92101',
        propertyType: PropertyType.MULTI_FAMILY,
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 2000,
        lotSize: 6000,
        yearBuilt: 2018,
        purchasePrice: 650000,
      },
      {
        address: '321 Sunset Boulevard',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90028',
        propertyType: PropertyType.TOWNHOUSE,
        bedrooms: 3,
        bathrooms: 2.5,
        squareFeet: 1800,
        yearBuilt: 2019,
        purchasePrice: 850000,
      },
      {
        address: '555 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        propertyType: PropertyType.COMMERCIAL,
        squareFeet: 3500,
        yearBuilt: 2010,
        purchasePrice: 1200000,
      },
      // Texas Properties
      {
        address: '1001 River Walk',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        propertyType: PropertyType.SINGLE_FAMILY,
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 2200,
        lotSize: 7500,
        yearBuilt: 2017,
        purchasePrice: 450000,
      },
      {
        address: '2222 Commerce Street',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        propertyType: PropertyType.MULTI_FAMILY,
        bedrooms: 6,
        bathrooms: 4,
        squareFeet: 3200,
        lotSize: 8000,
        yearBuilt: 2015,
        purchasePrice: 580000,
      },
      {
        address: '3333 Main Street',
        city: 'Houston',
        state: 'TX',
        zipCode: '77002',
        propertyType: PropertyType.CONDO,
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1200,
        yearBuilt: 2021,
        purchasePrice: 320000,
      },
      // Florida Properties
      {
        address: '4444 Ocean Drive',
        city: 'Miami',
        state: 'FL',
        zipCode: '33139',
        propertyType: PropertyType.CONDO,
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1100,
        yearBuilt: 2018,
        purchasePrice: 680000,
      },
      {
        address: '7777 Beach Boulevard',
        city: 'Tampa',
        state: 'FL',
        zipCode: '33602',
        propertyType: PropertyType.SINGLE_FAMILY,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1600,
        lotSize: 5500,
        yearBuilt: 2016,
        purchasePrice: 380000,
      },
      // New York Properties
      {
        address: '888 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        propertyType: PropertyType.CONDO,
        bedrooms: 1,
        bathrooms: 1,
        squareFeet: 800,
        yearBuilt: 2012,
        purchasePrice: 950000,
      },
      {
        address: '999 Park Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10021',
        propertyType: PropertyType.TOWNHOUSE,
        bedrooms: 4,
        bathrooms: 3.5,
        squareFeet: 2800,
        yearBuilt: 2014,
        purchasePrice: 2200000,
      },
      // Arizona Properties
      {
        address: '1111 Desert View',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        propertyType: PropertyType.SINGLE_FAMILY,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1700,
        lotSize: 6000,
        yearBuilt: 2019,
        purchasePrice: 420000,
      },
      {
        address: '1212 Mountain Road',
        city: 'Scottsdale',
        state: 'AZ',
        zipCode: '85251',
        propertyType: PropertyType.SINGLE_FAMILY,
        bedrooms: 5,
        bathrooms: 4,
        squareFeet: 3500,
        lotSize: 10000,
        yearBuilt: 2020,
        purchasePrice: 780000,
      },
      // Colorado Property
      {
        address: '1313 Rocky Mountain Way',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        propertyType: PropertyType.MULTI_FAMILY,
        bedrooms: 8,
        bathrooms: 6,
        squareFeet: 4200,
        lotSize: 9000,
        yearBuilt: 2016,
        purchasePrice: 920000,
      },
    ];

    // Filter out properties that already exist
    const propertiesToCreate = properties.filter(
      (prop) =>
        !existingAddresses.has(`${prop.address}-${prop.city}-${prop.state}`)
    );

    const createdProperties = [...(existingProperties || [])];
    for (const propData of propertiesToCreate) {
      try {
        const property = await propertyService.create(
          propData,
          user.organizationId
        );
        createdProperties.push(property);
        console.log(
          `  ✅ Created property: ${property.address}, ${property.city}, ${property.state}`
        );
      } catch (error) {
        console.log(
          `  ⚠️  Failed to create property ${propData.address}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
    console.log(
      `\n✅ Total properties in portfolio: ${createdProperties.length} (${propertiesToCreate.length} newly created)\n`
    );

    // 4. Create deals for all properties
    console.log('💰 Creating deals for portfolio...');
    let dealsCount = 0;

    // Helper function to generate deal data
    const generateDeal = (property: any, index: number) => {
      const basePrice = property.purchasePrice || 500000;
      const downPaymentPercent = [20, 25, 30, 20, 25][index % 5];
      const downPayment = Math.round(basePrice * (downPaymentPercent / 100));
      const loanAmount = basePrice - downPayment;
      const monthlyRental = Math.round(basePrice * 0.006); // ~0.6% of purchase price
      const annualRental = monthlyRental * 12;
      const monthlyExpenses = Math.round(monthlyRental * 0.35); // ~35% expense ratio
      const annualExpenses = monthlyExpenses * 12;

      const statuses = [
        DealStatus.UNDER_CONTRACT,
        DealStatus.CLOSED,
        DealStatus.DRAFT,
      ];
      const status = statuses[index % 3];

      const purchaseDates = [
        '2024-01-15',
        '2024-02-20',
        '2024-03-10',
        '2024-04-05',
        '2024-05-12',
        '2024-06-18',
        '2024-07-22',
        '2024-08-30',
        '2024-09-14',
        '2024-10-08',
        '2024-11-19',
        '2023-12-15',
        '2023-11-20',
        '2023-10-10',
        '2023-09-05',
      ];

      return {
        propertyId: property.id,
        purchasePrice: basePrice,
        purchaseDate: new Date(
          purchaseDates[index] || '2024-01-01'
        ).toISOString(),
        closingCosts: Math.round(basePrice * 0.02),
        rehabCosts: index % 3 === 0 ? Math.round(basePrice * 0.05) : undefined,
        loanType: [
          LoanType.CONVENTIONAL,
          LoanType.FHA,
          LoanType.CONVENTIONAL,
          LoanType.CASH,
          LoanType.CONVENTIONAL,
        ][index % 5],
        loanAmount: loanAmount,
        downPayment: downPayment,
        downPaymentPercent: downPaymentPercent,
        interestRate: 4.5 + (index % 3) * 0.25,
        loanTerm: 360,
        monthlyRentalIncome: monthlyRental,
        annualRentalIncome: annualRental,
        monthlyExpenses: monthlyExpenses,
        annualExpenses: annualExpenses,
        vacancyRate: 5 + (index % 3),
        propertyManagementRate: 8 + (index % 4),
        annualAppreciationRate: 3 + (index % 2) * 0.5,
        annualInflationRate: 2.5,
        capExReserve: Math.round(monthlyRental * 0.1),
        insurance: Math.round(basePrice * 0.0003),
        propertyTax: Math.round((basePrice * 0.012) / 12),
        status: status,
      };
    };

    for (let i = 0; i < createdProperties.length; i++) {
      const dealData = generateDeal(createdProperties[i], i);
      try {
        const deal = await dealService.create(dealData, organization.id);
        console.log(
          `  ✅ Created deal ${i + 1}/${
            createdProperties.length
          }: $${deal.purchasePrice.toLocaleString()} - ${
            createdProperties[i].city
          }, ${createdProperties[i].state}`
        );
        dealsCount++;
      } catch (error) {
        console.log(
          `  ⚠️  Failed to create deal for property ${i + 1}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
    console.log(`\n✅ Created ${dealsCount} deals\n`);

    console.log('🎉 Seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log(
      `   Organization: ${organization.name || 'My Real Estate Company'}`
    );
    console.log(`   Properties: ${createdProperties.length}`);
    console.log(`   Deals: ${dealsCount}`);
    console.log('\n📊 Portfolio Summary:');
    const totalValue = createdProperties.reduce((sum, p) => {
      const price =
        typeof p.purchasePrice === 'number'
          ? p.purchasePrice
          : parseFloat(p.purchasePrice || '0');
      return sum + price;
    }, 0);
    console.log(`   Total Portfolio Value: $${totalValue.toLocaleString()}`);
    const avgValue =
      createdProperties.length > 0
        ? Math.round(totalValue / createdProperties.length)
        : 0;
    console.log(`   Average Property Value: $${avgValue.toLocaleString()}`);
    const states = [...new Set(createdProperties.map((p) => p.state))];
    console.log(`   States: ${states.join(', ')}`);
    const propertyTypes = [
      ...new Set(createdProperties.map((p) => p.propertyType)),
    ];
    console.log(`   Property Types: ${propertyTypes.join(', ')}\n`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await app.close();
    process.exit(0);
  }
}

seed();

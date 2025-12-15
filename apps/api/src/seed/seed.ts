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
        // Set currentValue to simulate appreciation (5-15% above purchase price)
        const appreciationRate = 0.05 + Math.random() * 0.1; // 5-15% appreciation
        const currentValue = Math.round(
          (property.purchasePrice || 0) * (1 + appreciationRate)
        );
        await propertyService.update(
          property.id,
          { currentValue },
          user.organizationId
        );
        property.currentValue = currentValue;
        createdProperties.push(property);
        console.log(
          `  ✅ Created property: ${property.address}, ${property.city}, ${property.state} (Value: $${currentValue.toLocaleString()})`
        );
      } catch (error) {
        console.log(
          `  ⚠️  Failed to create property ${propData.address}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    // Update ALL properties to ensure they have currentValue set
    console.log('\n💰 Updating property values...');
    const allPropertiesForValueUpdate = await propertyService.findAll(user.organizationId);
    let updatedPropertyValues = 0;
    for (const property of allPropertiesForValueUpdate) {
      if (!property.currentValue && property.purchasePrice) {
        try {
          const appreciationRate = 0.05 + Math.random() * 0.1;
          const currentValue = Math.round(
            (property.purchasePrice || 0) * (1 + appreciationRate)
          );
          await propertyService.update(
            property.id,
            { currentValue },
            user.organizationId
          );
          property.currentValue = currentValue;
          updatedPropertyValues++;
          console.log(
            `  ✅ Updated property value: ${property.address} (Value: $${currentValue.toLocaleString()})`
          );
        } catch (error) {
          console.log(
            `  ⚠️  Failed to update property ${property.address}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      }
    }
    if (updatedPropertyValues > 0) {
      console.log(`\n✅ Updated ${updatedPropertyValues} property values\n`);
    } else {
      console.log(`\nℹ️  All properties already have currentValue set\n`);
    }
    console.log(
      `\n✅ Total properties in portfolio: ${createdProperties.length} (${propertiesToCreate.length} newly created)\n`
    );

    // 4. Create deals for all properties
    console.log('💰 Creating deals for portfolio...');
    let dealsCount = 0;

    // Helper function to generate deal data with realistic cash flow
    // This ensures positive cash flow by calculating expenses properly
    const generateDeal = (property: any, index: number) => {
      const basePrice = property.purchasePrice || 500000;
      
      // Down payment: 20-30% (varies by deal)
      const downPaymentPercent = [20, 25, 30, 20, 25, 30][index % 6];
      const downPayment = Math.round(basePrice * (downPaymentPercent / 100));
      const loanAmount = basePrice - downPayment;
      
      // Realistic rental income: 0.6-1.0% of purchase price per month
      // This ensures good cash-on-cash returns
      const rentalRate = 0.006 + (index % 5) * 0.0008; // 0.6% to 1.0%
      const monthlyRental = Math.round(basePrice * rentalRate);
      const annualRental = monthlyRental * 12;
      
      // Realistic expense breakdown (monthly)
      // Property tax: 1.0-1.5% of purchase price annually
      const propertyTaxAnnualRate = 0.01 + (index % 3) * 0.0025; // 1.0% to 1.5%
      const propertyTax = Math.round((basePrice * propertyTaxAnnualRate) / 12);
      
      // Insurance: 0.25-0.4% of purchase price annually
      const insuranceAnnualRate = 0.0025 + (index % 3) * 0.0005; // 0.25% to 0.4%
      const insurance = Math.round((basePrice * insuranceAnnualRate) / 12);
      
      // Property management: 8-12% of rental income (calculated monthly)
      const propertyManagementRate = 8 + (index % 5); // 8-12%
      const propertyManagement = Math.round(monthlyRental * (propertyManagementRate / 100));
      
      // Maintenance: 5-10% of rental income
      const maintenanceRate = 5 + (index % 6); // 5-10%
      const maintenance = Math.round(monthlyRental * (maintenanceRate / 100));
      
      // CapEx reserve: 8-12% of rental income
      const capExRate = 8 + (index % 5); // 8-12%
      const capExReserve = Math.round(monthlyRental * (capExRate / 100));
      
      // HOA fees: Only for condos/townhouses, 0-2% of purchase price annually
      const hasHOA = property.propertyType === 'CONDO' || property.propertyType === 'TOWNHOUSE';
      const hoaFees = hasHOA ? Math.round((basePrice * (0.005 + (index % 3) * 0.005)) / 12) : 0;
      
      // Total monthly operating expenses (NOT including vacancy - that's handled separately)
      const monthlyExpenses = propertyTax + insurance + propertyManagement + maintenance + capExReserve + hoaFees;
      const annualExpenses = monthlyExpenses * 12;
      
      // Vacancy rate: 5-8% (used in NOI calculation, not as an expense)
      const vacancyRate = 5 + (index % 4); // 5-8%
      
      // Loan terms - ensure positive cash flow
      // Interest rate: 4.0-5.5% (realistic for current market)
      const interestRate = 4.0 + (index % 4) * 0.375; // 4.0% to 5.5%
      const loanTerm = 360; // 30 years
      
      // Calculate debt service to verify cash flow will be positive
      const monthlyRate = interestRate / 100 / 12;
      const monthlyDebtService = loanAmount > 0 && interestRate > 0
        ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
          (Math.pow(1 + monthlyRate, loanTerm) - 1)
        : 0;
      const annualDebtService = monthlyDebtService * 12;
      
      // Calculate expected NOI and cash flow
      const effectiveGrossIncome = annualRental * (1 - vacancyRate / 100);
      const expectedNOI = effectiveGrossIncome - annualExpenses;
      const expectedCashFlow = expectedNOI - annualDebtService;
      
      // If cash flow would be negative, adjust rental income upward
      let adjustedMonthlyRental = monthlyRental;
      if (expectedCashFlow < 0) {
        // Increase rental to ensure at least 5% cash-on-cash return
        const targetAnnualCashFlow = (downPayment + (basePrice * 0.02)) * 0.05; // 5% of cash invested
        const requiredNOI = targetAnnualCashFlow + annualDebtService;
        const requiredGrossIncome = (requiredNOI + annualExpenses) / (1 - vacancyRate / 100);
        adjustedMonthlyRental = Math.round(requiredGrossIncome / 12);
      }
      
      const statuses = [
        DealStatus.CLOSED,
        DealStatus.CLOSED,
        DealStatus.CLOSED,
        DealStatus.UNDER_CONTRACT,
        DealStatus.CLOSED,
        DealStatus.CLOSED,
      ];
      const status = statuses[index % 6];

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

      // Closing costs: 2-3% of purchase price
      const closingCosts = Math.round(basePrice * (0.02 + (index % 2) * 0.005));
      
      // Rehab costs: 0-8% of purchase price (some properties need work)
      const rehabCosts = index % 5 === 0 ? Math.round(basePrice * (0.03 + (index % 4) * 0.0125)) : undefined;

      return {
        propertyId: property.id,
        purchasePrice: basePrice,
        purchaseDate: new Date(
          purchaseDates[index] || '2024-01-01'
        ).toISOString(),
        closingCosts: closingCosts,
        rehabCosts: rehabCosts,
        loanType: [
          LoanType.CONVENTIONAL,
          LoanType.CONVENTIONAL,
          LoanType.FHA,
          LoanType.CONVENTIONAL,
          LoanType.CASH,
          LoanType.CONVENTIONAL,
        ][index % 6],
        loanAmount: loanAmount,
        downPayment: downPayment,
        downPaymentPercent: downPaymentPercent,
        interestRate: interestRate,
        loanTerm: loanTerm,
        monthlyRentalIncome: adjustedMonthlyRental,
        annualRentalIncome: adjustedMonthlyRental * 12,
        monthlyExpenses: monthlyExpenses,
        annualExpenses: annualExpenses,
        vacancyRate: vacancyRate,
        propertyManagementRate: propertyManagementRate,
        annualAppreciationRate: 3 + (index % 3) * 0.5, // 3-4.5%
        annualInflationRate: 2.5,
        capExReserve: capExReserve,
        insurance: insurance,
        propertyTax: propertyTax,
        hoaFees: hoaFees || undefined,
        status: status,
      };
    };

    // Get all properties (including existing ones) to ensure all deals are updated
    const allPropertiesForDeals = await propertyService.findAll(user.organizationId);
    
    // Get existing deals to avoid duplicates
    const existingDeals = await dealService.findAll(organization.id);
    const existingDealPropertyIds = new Set(existingDeals.map(d => d.propertyId));

    for (let i = 0; i < allPropertiesForDeals.length; i++) {
      const property = allPropertiesForDeals[i];
      const dealData = generateDeal(property, i);
      
      // Check if deal already exists for this property
      const existingDeal = existingDeals.find(d => d.propertyId === property.id);
      
      if (existingDeal) {
        // Always update existing deals to ensure they have proper values
        // This fixes deals that were created before the seed script was updated
        try {
          await dealService.update(existingDeal.id, {
            monthlyRentalIncome: dealData.monthlyRentalIncome,
            annualRentalIncome: dealData.annualRentalIncome,
            monthlyExpenses: dealData.monthlyExpenses,
            annualExpenses: dealData.annualExpenses,
            downPayment: dealData.downPayment,
            closingCosts: dealData.closingCosts,
            rehabCosts: dealData.rehabCosts,
            loanAmount: dealData.loanAmount,
            downPaymentPercent: dealData.downPaymentPercent,
            interestRate: dealData.interestRate,
            loanTerm: dealData.loanTerm,
            vacancyRate: dealData.vacancyRate,
            propertyManagementRate: dealData.propertyManagementRate,
            capExReserve: dealData.capExReserve,
            insurance: dealData.insurance,
            propertyTax: dealData.propertyTax,
            hoaFees: dealData.hoaFees,
            annualAppreciationRate: dealData.annualAppreciationRate,
            annualInflationRate: dealData.annualInflationRate,
            status: dealData.status,
          }, organization.id);
          console.log(
            `  ✅ Updated deal for property ${i + 1}/${
              allPropertiesForDeals.length
            }: ${property.city}, ${property.state} (Rental: $${dealData.monthlyRentalIncome.toLocaleString()}/mo, Cash Invested: $${((dealData.downPayment || 0) + (dealData.closingCosts || 0) + (dealData.rehabCosts || 0)).toLocaleString()})`
          );
          dealsCount++;
        } catch (error) {
          console.log(
            `  ⚠️  Failed to update deal for property ${i + 1}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      } else {
        // Create new deal
        try {
          const deal = await dealService.create(dealData, organization.id);
          console.log(
            `  ✅ Created deal ${i + 1}/${
              allPropertiesForDeals.length
            }: $${deal.purchasePrice.toLocaleString()} - ${
              property.city
            }, ${property.state} (Rental: $${dealData.monthlyRentalIncome.toLocaleString()}/mo, Cash Invested: $${((dealData.downPayment || 0) + (dealData.closingCosts || 0) + (dealData.rehabCosts || 0)).toLocaleString()})`
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
    }
    console.log(`\n✅ Processed ${dealsCount} deals (created/updated)\n`);

    console.log('🎉 Seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log(
      `   Organization: ${organization.name || 'My Real Estate Company'}`
    );
    const allProperties = await propertyService.findAll(user.organizationId);
    console.log(`   Properties: ${allProperties.length}`);
    console.log(`   Deals: ${dealsCount}`);
    console.log('\n📊 Portfolio Summary:');
    const totalValue = allProperties.reduce((sum, p) => {
      const value =
        typeof p.currentValue === 'number'
          ? p.currentValue
          : parseFloat(p.currentValue?.toString() || '0') ||
            (typeof p.purchasePrice === 'number'
              ? p.purchasePrice
              : parseFloat(p.purchasePrice?.toString() || '0'));
      return sum + value;
    }, 0);
    console.log(`   Total Portfolio Value: $${totalValue.toLocaleString()}`);
    const avgValue =
      allProperties.length > 0
        ? Math.round(totalValue / allProperties.length)
        : 0;
    console.log(`   Average Property Value: $${avgValue.toLocaleString()}`);
    
    // Calculate total cash invested from all deals
    const allDeals = await dealService.findAll(organization.id);
    const totalCashInvested = allDeals.reduce((sum, deal) => {
      return sum + (deal.downPayment || 0) + (deal.closingCosts || 0) + (deal.rehabCosts || 0);
    }, 0);
    console.log(`   Total Cash Invested: $${totalCashInvested.toLocaleString()}`);
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

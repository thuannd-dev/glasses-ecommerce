using System;
using Domain;
using Microsoft.AspNetCore.Identity;

namespace Persistence;

public class DbInitializer
{
    public static async Task SeedData(AppDbContext context, UserManager<User> userManager, RoleManager<IdentityRole<Guid>> roleManager)
    {
        // Seed Roles
        var roles = new List<string>
        {
            "Customer",
            "Sales",
            "Operations",
            "Manager",
            "Admin"
        };

        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
            }
        }

        // Seed Users (1 per role)
        var users = new List<User>
        {
            new() {DisplayName = "Customer User", UserName = "customer@test.com", Email = "customer@test.com"} ,
            new() {DisplayName = "Sales User", UserName = "sales@test.com", Email = "sales@test.com"} ,
            new() {DisplayName = "Operations User", UserName = "operations@test.com", Email = "operations@test.com"} ,
            new() {DisplayName = "Manager User", UserName = "manager@test.com", Email = "manager@test.com"} ,
            new() {DisplayName = "Admin User", UserName = "admin@test.com", Email = "admin@test.com"} ,
        };

        if (userManager.Users.Count() < 100) // Changed from .Any() to force reseed - change back to .Any() after deployment
        {
            // Delete existing users to avoid conflicts
            var existingUsers = userManager.Users.ToList();
            foreach (var existingUser in existingUsers)
            {
                await userManager.DeleteAsync(existingUser);
            }
            
            for (int i = 0; i < users.Count; i++)
            {
                //doc: The password for the user to hash and store.
                //so if you go for a weak password your user will not be created and it fail sliently
                //Because we're simply not doing any to error handling inside here
                await userManager.CreateAsync(users[i], "Pa$$w0rd");
                //don't need to save changes because DOC: Creates the specified user in the backing store with given password, as an asynchronous operation.
                //backing store which means where the data is stored (database)
                
                // Assign role to user
                await userManager.AddToRoleAsync(users[i], roles[i]);
            }
        }

        // Seed Activities
        if (context.Activities.Count() < 100) // Changed from .Any() to force reseed - change back to .Any() after deployment
        {
            // Delete existing activities to avoid conflicts
            context.Activities.RemoveRange(context.Activities);
            await context.SaveChangesAsync();
            
            var activities = new List<Activity>
        {
            new()
            {
                Title = "Past Activity 1",
                Date = DateTime.Now.AddMonths(-2),
                Description = "Activity 2 months ago",
                Category = "drinks",
                City = "London",
                Venue =
                    "The Lamb and Flag, 33, Rose Street, Seven Dials, Covent Garden, London, Greater London, England, WC2E 9EB, United Kingdom",
                Latitude = 51.51171665,
                Longitude = -0.1256611057818921,
                Attendees =
                [
                    new()
                    {
                        UserId = users[0].Id,
                        IsHost = true,
                    },
                    new()
                    {
                        UserId = users[1].Id,
                        IsHost = false,
                    }
                ]
            },
            new()
            {
                Title = "Past Activity 2",
                Date = DateTime.Now.AddMonths(-1),
                Description = "Activity 1 month ago",
                Category = "culture",
                City = "Paris",
                Venue =
                    "Louvre Museum, Rue Saint-Honoré, Quartier du Palais Royal, 1st Arrondissement, Paris, Ile-de-France, Metropolitan France, 75001, France",
                Latitude = 48.8611473,
                Longitude = 2.33802768704666,
                Attendees =
                [
                    new()
                    {
                        UserId = users[1].Id,
                        IsHost = true,
                    },
                    new()
                    {
                        UserId = users[2].Id
                    },
                    new()
                    {
                        UserId = users[0].Id,
                    }
                ]
            },
            new()
            {
                Title = "Future Activity 1",
                Date = DateTime.Now.AddMonths(1),
                Description = "Activity 1 month in future",
                Category = "culture",
                City = "London",
                Venue = "Natural History Museum",
                Latitude = 51.496510900000004,
                Longitude = -0.17600190725447445,
                Attendees =
                [
                    new()
                    {
                        UserId = users[2].Id,
                        IsHost = true,
                    }
                ]
            },
            new()
            {
                Title = "Future Activity 2",
                Date = DateTime.Now.AddMonths(2),
                Description = "Activity 2 months in future",
                Category = "music",
                City = "London",
                Venue = "The O2",
                Latitude = 51.502936649999995,
                Longitude = 0.0032029278126681844,
                Attendees =
                [
                    new()
                    {
                        UserId = users[0].Id,
                        IsHost = true,
                    },
                    new()
                    {
                        UserId = users[2].Id
                    }
                ]
            },
            new()
            {
                Title = "Future Activity 3",
                Date = DateTime.Now.AddMonths(3),
                Description = "Activity 3 months in future",
                Category = "drinks",
                City = "London",
                Venue = "The Mayflower",
                Latitude = 51.501778,
                Longitude = -0.053577,
                Attendees =
                [
                    new()
                    {
                        UserId = users[1].Id,
                        IsHost = true,
                    }
                ]
            },
            new()
            {
                Title = "Future Activity 4",
                Date = DateTime.Now.AddMonths(4),
                Description = "Activity 4 months in future",
                Category = "drinks",
                City = "London",
                Venue = "The Blackfriar",
                Latitude = 51.512146650000005,
                Longitude = -0.10364680647106028,
                Attendees =
                [
                    new()
                    {
                        UserId = users[2].Id,
                        IsHost = true,
                    },
                    new()
                    {
                        UserId = users[0].Id
                    }
                ]
            },
            new()
            {
                Title = "Future Activity 5",
                Date = DateTime.Now.AddMonths(5),
                Description = "Activity 5 months in future",
                Category = "culture",
                City = "London",
                Venue =
                    "Sherlock Holmes Museum, 221b, Baker Street, Marylebone, London, Greater London, England, NW1 6XE, United Kingdom",
                Latitude = 51.5237629,
                Longitude = -0.1584743,
                Attendees =
                [
                    new()
                    {
                        UserId = users[0].Id,
                        IsHost = true,
                    }
                ]
            },
            new()
            {
                Title = "Future Activity 6",
                Date = DateTime.Now.AddMonths(6),
                Description = "Activity 6 months in future",
                Category = "music",
                City = "London",
                Venue =
                    "Roundhouse, Chalk Farm Road, Maitland Park, Chalk Farm, London Borough of Camden, London, Greater London, England, NW1 8EH, United Kingdom",
                Latitude = 51.5432505,
                Longitude = -0.15197608174931165,
                Attendees =
                [
                    new()
                    {
                        UserId = users[1].Id,
                        IsHost = true,
                    },
                    new()
                    {
                        UserId = users[0].Id
                    }
                ]
            },
            new()
            {
                Title = "Future Activity 7",
                Date = DateTime.Now.AddMonths(7),
                Description = "Activity 7 months in future",
                Category = "travel",
                City = "London",
                Venue = "River Thames, England, United Kingdom",
                Latitude = 51.5575525,
                Longitude = -0.781404,
                Attendees =
                [
                    new()
                    {
                        UserId = users[2].Id,
                        IsHost = true,
                    },
                    new()
                    {
                        UserId = users[1].Id
                    }
                ]
            },
            new()
            {
                Title = "Future Activity 8",
                Date = DateTime.Now.AddMonths(8),
                Description = "Activity 8 months in future",
                Category = "film",
                City = "London",
                Venue = "Odeon Leicester Square",
                Latitude = 51.5575525,
                Longitude = -0.781404,
                Attendees =
                [
                    new()
                    {
                        UserId = users[0].Id,
                        IsHost = true,
                    }
                ]
            }
        };

            await context.Activities.AddRangeAsync(activities);
            await context.SaveChangesAsync();
        }

        // Seed Product Categories
        if (context.ProductCategories.Count() < 200) // Changed from .Any() to force reseed - change back to .Any() after deployment
        {
            // Delete existing data to avoid conflicts (in correct order due to FK constraints)
            context.ProductImages.RemoveRange(context.ProductImages);
            context.Stocks.RemoveRange(context.Stocks);
            context.ProductVariants.RemoveRange(context.ProductVariants);
            context.Products.RemoveRange(context.Products);
            context.ProductCategories.RemoveRange(context.ProductCategories);
            await context.SaveChangesAsync();
            
            var categories = new List<ProductCategory>
            {
                new()
                {
                    Name = "Eyeglasses",
                    Slug = "eyeglasses",
                    Description = "Prescription optical frames for everyday wear and vision correction",
                    IsActive = true
                },
                new()
                {
                    Name = "Sunglasses",
                    Slug = "sunglasses",
                    Description = "UV protection sunglasses for outdoor wear and sun protection",
                    IsActive = true
                }
            };

            await context.ProductCategories.AddRangeAsync(categories);
            await context.SaveChangesAsync();

            // Phase 1: Seed Products (without variants)
            var products = new List<Product>
            {
                // 1. Slim Metal (Eyeglasses)
                new()
                {
                    CategoryId = categories[0].Id,
                    ProductName = "Slim Metal",
                    Type = ProductType.Frame,
                    Brand = "Ray-Ban",
                    Description = "Minimalist and lightweight design featuring thin metal frames that offer a sleek, professional appearance. Perfect for everyday wear with a barely-there feel. The refined aesthetic works well in both professional and casual settings.",
                    Status = ProductStatus.Active
                },

                // 2. Semi-Rimless Rectangular Sunglasses
                new()
                {
                    CategoryId = categories[1].Id,
                    ProductName = "Semi-Rimless Rectangular",
                    Type = ProductType.Frame,
                    Brand = "Oakley",
                    Description = "Contemporary design with metal frame on top and rimless bottom for an open, modern look. Offers excellent UV protection while maintaining a sporty-elegant aesthetic. Ideal for those seeking a balance between classic and contemporary style.",
                    Status = ProductStatus.Active
                },

                // 3. Rimless (Eyeglasses)
                new()
                {
                    CategoryId = categories[0].Id,
                    ProductName = "Rimless",
                    Type = ProductType.Frame,
                    Brand = "Warby Parker",
                    Description = "Ultra-minimalist design with no frame around lenses, held by temples and bridge only. Provides an almost invisible, sophisticated look that doesn't obscure facial features. Lightweight and comfortable for all-day wear.",
                    Status = ProductStatus.Active
                },

                // 4. Rectangular Sunglasses
                new()
                {
                    CategoryId = categories[1].Id,
                    ProductName = "Rectangular Sunglasses",
                    Type = ProductType.Frame,
                    Brand = "Oakley",
                    Description = "Classic rectangular shape that suits most face shapes with bold, defined lines. Offers full coverage and excellent sun protection with a timeless, versatile style. Perfect for everyday wear and various outdoor activities.",
                    Status = ProductStatus.Active
                },

                // 5. Oval Sunglasses
                new()
                {
                    CategoryId = categories[1].Id,
                    ProductName = "Oval Sunglasses",
                    Type = ProductType.Frame,
                    Brand = "Warby Parker",
                    Description = "Softly curved oval lenses create a retro-vintage aesthetic reminiscent of 90s fashion. The rounded shape softens angular features and adds a touch of nostalgia. Ideal for those seeking a unique, fashion-forward look.",
                    Status = ProductStatus.Active
                },

                // 6. Modern Square (Eyeglasses)
                new()
                {
                    CategoryId = categories[0].Id,
                    ProductName = "Modern Square",
                    Type = ProductType.Frame,
                    Brand = "Warby Parker",
                    Description = "Contemporary interpretation of the square frame with clean lines and modern proportions. Bold enough to make a statement while remaining versatile for daily wear. Suits oval and round face shapes particularly well.",
                    Status = ProductStatus.Active
                },

                // 7. Geometric Polygon (Eyeglasses)
                new()
                {
                    CategoryId = categories[0].Id,
                    ProductName = "Geometric Polygon",
                    Type = ProductType.Frame,
                    Brand = "Mykita",
                    Description = "Avant-garde design featuring angular, multi-sided shapes that break from traditional frame styles. Perfect for fashion-forward individuals who want to make a bold statement. The unique geometry adds architectural interest to your look.",
                    Status = ProductStatus.Active
                },

                // 8. Classic Square (Eyeglasses)
                new()
                {
                    CategoryId = categories[0].Id,
                    ProductName = "Classic Square",
                    Type = ProductType.Frame,
                    Brand = "Ray-Ban",
                    Description = "Timeless square frame design that has remained popular for decades across all demographics. Offers a professional yet approachable look with substantial frame presence. The iconic shape works well with most face shapes and personal styles.",
                    Status = ProductStatus.Active
                },

                // 9. Classic Browline (Eyeglasses)
                new()
                {
                    CategoryId = categories[0].Id,
                    ProductName = "Classic Browline",
                    Type = ProductType.Frame,
                    Brand = "Ray-Ban",
                    Description = "Vintage-inspired design featuring bold upper rim that mimics the natural browline. The thicker top frame draws attention upward while metal lower portion keeps the look balanced. A sophisticated retro style that gained popularity in the 1950s-60s and remains fashionable today.",
                    Status = ProductStatus.Active
                },

                // 10. Cat Eye (Eyeglasses)
                new()
                {
                    CategoryId = categories[0].Id,
                    ProductName = "Cat Eye",
                    Type = ProductType.Frame,
                    Brand = "Ray-Ban",
                    Description = "Distinctive upswept outer edges create a feminine, vintage-glamour aesthetic popular since the 1950s. The lifted corners elongate the eyes and add a touch of retro sophistication. Particularly flattering on heart-shaped and oval faces.",
                    Status = ProductStatus.Active
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();

            // Phase 1.5: Seed Product Images (lifestyle/catalog images)
            var productImages = new List<ProductImage>
            {
                // Slim Metal - Product lifestyle image
                new()
                {
                    ProductId = products[0].Id,
                    ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101972/glasses/smrffawtkxqqmgtnibky.png",
                    AltText = "Slim Metal Collection",
                    DisplayOrder = 0
                },
                
                // Semi-Rimless Rectangular - Product lifestyle image
                new()
                {
                    ProductId = products[1].Id,
                    ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101829/glasses/j3bbtgtdghxndvn7lxv2.png",
                    AltText = "Semi-Rimless Rectangular Collection",
                    DisplayOrder = 0
                },
                
                // Rimless - Product lifestyle image
                new()
                {
                    ProductId = products[2].Id,
                    ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101628/glasses/wkhg3alhapdbbyiwh8mq.png",
                    AltText = "Rimless Collection",
                    DisplayOrder = 0
                },
                
                // Rectangular Sunglasses - Product lifestyle image
                new()
                {
                    ProductId = products[3].Id,
                    ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101609/glasses/enjpf5zj1rh634ddroew.png",
                    AltText = "Rectangular Sunglasses Collection",
                    DisplayOrder = 0
                },
                
                // Oval Sunglasses - Product lifestyle image
                new()
                {
                    ProductId = products[4].Id,
                    ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101589/glasses/q1nlge8bp63ifcqz2i2n.png",
                    AltText = "Oval Sunglasses Collection",
                    DisplayOrder = 0
                },
                
                // Modern Square - Product lifestyle image
                new()
                {
                    ProductId = products[5].Id,
                    ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101475/glasses/ytdn1ntosxnuyoi9lwbe.png",
                    AltText = "Modern Square Collection",
                    DisplayOrder = 0
                },
                
                // Geometric Polygon - Product lifestyle image
                new()
                {
                    ProductId = products[6].Id,
                    ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101361/glasses/ztk0bwfcmiwohe74vcvv.png",
                    AltText = "Geometric Polygon Collection",
                    DisplayOrder = 0
                },
                
                // Classic Square - Product lifestyle image
                new()
                {
                    ProductId = products[7].Id,
                    ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100968/glasses/jxtqxecyepxbg1hxh2ce.png",
                    AltText = "Classic Square Collection",
                    DisplayOrder = 0
                },
                
                // Classic Browline - Product lifestyle image
                new()
                {
                    ProductId = products[8].Id,
                    ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100913/glasses/yxbm35bbcyxdovtcljsz.png",
                    AltText = "Classic Browline Collection",
                    DisplayOrder = 0
                },
                
                // Cat Eye - Product lifestyle image
                new()
                {
                    ProductId = products[9].Id,
                    ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100852/glasses/ym2kzgsnxtshxajg0hu0.png",
                    AltText = "Cat Eye Collection",
                    DisplayOrder = 0
                }
            };

            await context.ProductImages.AddRangeAsync(productImages);
            await context.SaveChangesAsync();

            // Phase 2: Seed Product Variants with Images
            var variants = new List<ProductVariant>
            {
                // Slim Metal - Golden Pink
                new()
                {
                    ProductId = products[0].Id,
                    SKU = "SM-GP-001",
                    VariantName = "Golden Pink",
                    Color = "Golden Pink",
                    Size = "Medium",
                    Material = "Titanium",
                    FrameWidth = 138.00m,
                    LensWidth = 53.00m,
                    BridgeWidth = 18.00m,
                    TempleLength = 142.00m,
                    Price = 159.00m,
                    CompareAtPrice = 219.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101972/glasses/smrffawtkxqqmgtnibky.png",
                            AltText = "Slim Metal Golden Pink - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101965/glasses/hqjxgbg4xmudxc0bjdkm.png",
                            AltText = "Slim Metal Golden Pink - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101959/glasses/mnzxxfgidd6g244y1ymd.png",
                            AltText = "Slim Metal Golden Pink - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Slim Metal - Black
                new()
                {
                    ProductId = products[0].Id,
                    SKU = "SM-BK-001",
                    VariantName = "Black",
                    Color = "Black",
                    Size = "Medium",
                    Material = "Titanium",
                    FrameWidth = 138.00m,
                    LensWidth = 53.00m,
                    BridgeWidth = 18.00m,
                    TempleLength = 142.00m,
                    Price = 149.00m,
                    CompareAtPrice = 199.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101950/glasses/mh6ywubnvdxc4qtsi9aq.png",
                            AltText = "Slim Metal Black - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101943/glasses/vt8brljnmvaxgkp4dvcy.png",
                            AltText = "Slim Metal Black - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101938/glasses/fluhmirgpr37mbdkzba3.png",
                            AltText = "Slim Metal Black - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Semi-Rimless Rectangular - Black
                new()
                {
                    ProductId = products[1].Id,
                    SKU = "SRR-BK-001",
                    VariantName = "Black",
                    Color = "Black",
                    Size = "Large",
                    Material = "Mixed Metal",
                    FrameWidth = 143.00m,
                    LensWidth = 57.00m,
                    BridgeWidth = 17.00m,
                    TempleLength = 142.00m,
                    Price = 179.00m,
                    CompareAtPrice = 249.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101829/glasses/j3bbtgtdghxndvn7lxv2.png",
                            AltText = "Semi-Rimless Rectangular Black - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101825/glasses/yiky23f5h4n1yvkpf1l2.png",
                            AltText = "Semi-Rimless Rectangular Black - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101821/glasses/lqzivkyrcoezak4io5nv.png",
                            AltText = "Semi-Rimless Rectangular Black - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Rimless - Clear
                new()
                {
                    ProductId = products[2].Id,
                    SKU = "RL-CL-001",
                    VariantName = "Clear",
                    Color = "Clear",
                    Size = "Small",
                    Material = "Titanium",
                    FrameWidth = 134.00m,
                    LensWidth = 51.00m,
                    BridgeWidth = 19.00m,
                    TempleLength = 138.00m,
                    Price = 169.00m,
                    CompareAtPrice = 239.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101628/glasses/wkhg3alhapdbbyiwh8mq.png",
                            AltText = "Rimless Clear - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101623/glasses/w2n2olttytjxtdm0strw.png",
                            AltText = "Rimless Clear - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101619/glasses/bjhfgr2ucwnyn998kg2v.png",
                            AltText = "Rimless Clear - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Rectangular Sunglasses - Black
                new()
                {
                    ProductId = products[3].Id,
                    SKU = "RSG-BK-001",
                    VariantName = "Black",
                    Color = "Black",
                    Size = "Large",
                    Material = "Acetate",
                    FrameWidth = 145.00m,
                    LensWidth = 56.00m,
                    BridgeWidth = 18.00m,
                    TempleLength = 143.00m,
                    Price = 139.00m,
                    CompareAtPrice = 189.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101609/glasses/enjpf5zj1rh634ddroew.png",
                            AltText = "Rectangular Sunglasses Black - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101603/glasses/vkhxto48wf1br360gzax.png",
                            AltText = "Rectangular Sunglasses Black - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101599/glasses/rysxvsgagbgyunfbejrx.png",
                            AltText = "Rectangular Sunglasses Black - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Oval Sunglasses - Black
                new()
                {
                    ProductId = products[4].Id,
                    SKU = "OSG-BK-001",
                    VariantName = "Black",
                    Color = "Black",
                    Size = "Medium",
                    Material = "Metal",
                    FrameWidth = 139.00m,
                    LensWidth = 53.00m,
                    BridgeWidth = 20.00m,
                    TempleLength = 143.00m,
                    Price = 129.00m,
                    CompareAtPrice = 179.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101589/glasses/q1nlge8bp63ifcqz2i2n.png",
                            AltText = "Oval Sunglasses Black - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101584/glasses/edu5pm93zmbjnrl6zulm.png",
                            AltText = "Oval Sunglasses Black - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101580/glasses/jzyhyatuxa2abjm8dma.png",
                            AltText = "Oval Sunglasses Black - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Modern Square - Black
                new()
                {
                    ProductId = products[5].Id,
                    SKU = "MSQ-BK-001",
                    VariantName = "Black",
                    Color = "Black",
                    Size = "Medium",
                    Material = "Acetate",
                    FrameWidth = 142.00m,
                    LensWidth = 55.00m,
                    BridgeWidth = 18.00m,
                    TempleLength = 143.00m,
                    Price = 159.00m,
                    CompareAtPrice = 219.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101475/glasses/ytdn1ntosxnuyoi9lwbe.png",
                            AltText = "Modern Square Black - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101470/glasses/axcrn3lwszxztluuo6zd.png",
                            AltText = "Modern Square Black - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101481/glasses/rvhezt2oetdru6lx9cho.png",
                            AltText = "Modern Square Black - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Modern Square - White
                new()
                {
                    ProductId = products[5].Id,
                    SKU = "MSQ-WH-001",
                    VariantName = "White",
                    Color = "White",
                    Size = "Medium",
                    Material = "Acetate",
                    FrameWidth = 142.00m,
                    LensWidth = 55.00m,
                    BridgeWidth = 18.00m,
                    TempleLength = 143.00m,
                    Price = 159.00m,
                    CompareAtPrice = 219.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101496/glasses/equwygka7edw9a78bbv8.png",
                            AltText = "Modern Square White - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101492/glasses/monnx1eshtby7qiznrty.png",
                            AltText = "Modern Square White - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101487/glasses/pvo8w26rwuatl2ezynph.png",
                            AltText = "Modern Square White - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Geometric Polygon - Gold (premium pricing)
                new()
                {
                    ProductId = products[6].Id,
                    SKU = "GP-GD-001",
                    VariantName = "Gold",
                    Color = "Gold",
                    Size = "Medium",
                    Material = "Stainless Steel",
                    FrameWidth = 140.00m,
                    LensWidth = 52.00m,
                    BridgeWidth = 19.00m,
                    TempleLength = 142.00m,
                    Price = 209.00m,
                    CompareAtPrice = 289.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101361/glasses/ztk0bwfcmiwohe74vcvv.png",
                            AltText = "Geometric Polygon Gold - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101354/glasses/bptdh3enddtmypdruvba.png",
                            AltText = "Geometric Polygon Gold - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101344/glasses/zocwbcx2tessgv6k6vaa.png",
                            AltText = "Geometric Polygon Gold - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Geometric Polygon - Silver (premium pricing)
                new()
                {
                    ProductId = products[6].Id,
                    SKU = "GP-SV-001",
                    VariantName = "Silver",
                    Color = "Silver",
                    Size = "Medium",
                    Material = "Stainless Steel",
                    FrameWidth = 140.00m,
                    LensWidth = 52.00m,
                    BridgeWidth = 19.00m,
                    TempleLength = 142.00m,
                    Price = 199.00m,
                    CompareAtPrice = 269.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101431/glasses/b4cqes1vlplfxt5fyi7v.png",
                            AltText = "Geometric Polygon Silver - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101416/glasses/t1ks0xkye4dholaedzzw.png",
                            AltText = "Geometric Polygon Silver - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770101387/glasses/rmz4ccpfqqzndlqvu6xy.png",
                            AltText = "Geometric Polygon Silver - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Classic Square - Black
                new()
                {
                    ProductId = products[7].Id,
                    SKU = "CSQ-BK-001",
                    VariantName = "Black",
                    Color = "Black",
                    Size = "Large",
                    Material = "Acetate",
                    FrameWidth = 143.00m,
                    LensWidth = 55.00m,
                    BridgeWidth = 17.00m,
                    TempleLength = 142.00m,
                    Price = 145.00m,
                    CompareAtPrice = 199.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100968/glasses/jxtqxecyepxbg1hxh2ce.png",
                            AltText = "Classic Square Black - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100962/glasses/lcnvhujgmpgt8mg4f1qb.png",
                            AltText = "Classic Square Black - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100956/glasses/ucsluc8rgaf3h0hc8idk.png",
                            AltText = "Classic Square Black - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Classic Browline - Tortoise
                new()
                {
                    ProductId = products[8].Id,
                    SKU = "CBL-TT-001",
                    VariantName = "Tortoise",
                    Color = "Tortoise",
                    Size = "Large",
                    Material = "Mixed Acetate",
                    FrameWidth = 144.00m,
                    LensWidth = 52.00m,
                    BridgeWidth = 21.00m,
                    TempleLength = 144.00m,
                    Price = 169.00m,
                    CompareAtPrice = 229.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100913/glasses/yxbm35bbcyxdovtcljsz.png",
                            AltText = "Classic Browline Tortoise - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100906/glasses/eq9mdpwbqcgtm1lfrq80.png",
                            AltText = "Classic Browline Tortoise - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100901/glasses/xc37j5wvjzyo9nomh02h.png",
                            AltText = "Classic Browline Tortoise - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Cat Eye - Glossy Black
                new()
                {
                    ProductId = products[9].Id,
                    SKU = "CE-GB-001",
                    VariantName = "Glossy Black",
                    Color = "Glossy Black",
                    Size = "Medium",
                    Material = "Acetate",
                    FrameWidth = 139.00m,
                    LensWidth = 52.00m,
                    BridgeWidth = 17.00m,
                    TempleLength = 142.00m,
                    Price = 159.00m,
                    CompareAtPrice = 219.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100852/glasses/ym2kzgsnxtshxajg0hu0.png",
                            AltText = "Cat Eye Glossy Black - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100846/glasses/l5ncqjfu60bbkdz5119g.png",
                            AltText = "Cat Eye Glossy Black - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100842/glasses/cxiwzrmad5zyyer1ext5.png",
                            AltText = "Cat Eye Glossy Black - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Cat Eye - Ivory
                new()
                {
                    ProductId = products[9].Id,
                    SKU = "CE-IV-001",
                    VariantName = "Ivory",
                    Color = "Ivory",
                    Size = "Medium",
                    Material = "Acetate",
                    FrameWidth = 139.00m,
                    LensWidth = 52.00m,
                    BridgeWidth = 17.00m,
                    TempleLength = 142.00m,
                    Price = 159.00m,
                    CompareAtPrice = 219.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100825/glasses/oit35g8ni7qx0h9jqqfa.png",
                            AltText = "Cat Eye Ivory - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100818/glasses/j3fii2drgh5ptxfwwmmc.png",
                            AltText = "Cat Eye Ivory - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100759/glasses/yuumggtogh1xhc4kcxvg.png",
                            AltText = "Cat Eye Ivory - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                },

                // Cat Eye - Red
                new()
                {
                    ProductId = products[9].Id,
                    SKU = "CE-RD-001",
                    VariantName = "Red",
                    Color = "Red",
                    Size = "Medium",
                    Material = "Acetate",
                    FrameWidth = 139.00m,
                    LensWidth = 52.00m,
                    BridgeWidth = 17.00m,
                    TempleLength = 142.00m,
                    Price = 159.00m,
                    CompareAtPrice = 219.00m,
                    IsActive = true,
                    Images =
                    [
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100885/glasses/alu8clcjhvool7n3ljab.png",
                            AltText = "Cat Eye Red - Front View",
                            DisplayOrder = 0
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100890/glasses/d52ffej4ayqwffwpzh6p.png",
                            AltText = "Cat Eye Red - Side View",
                            DisplayOrder = 1
                        },
                        new()
                        {
                            ImageUrl = "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1770100881/glasses/agj2kr6elyeyuggtuca1.png",
                            AltText = "Cat Eye Red - Angle View",
                            DisplayOrder = 2
                        }
                    ]
                }
            };

            await context.ProductVariants.AddRangeAsync(variants);
            await context.SaveChangesAsync();

            // Seed Stock for all variants
            var stocks = new List<Stock>();
            foreach (var variant in variants)
            {
                stocks.Add(new Stock
                {
                    ProductVariantId = variant.Id,
                    QuantityOnHand = 100,
                    QuantityReserved = 0,
                    Notes = "Initial inventory"
                });
            }

            await context.Stocks.AddRangeAsync(stocks);
            await context.SaveChangesAsync();
        }
    }

}


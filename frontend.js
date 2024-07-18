// const [listings, setListings] = useState([]);

//   async function fetchListings() {
//     const response = await fetch("http://192.168.2.105:3000/listings");
//     console.log("response", response);
//     const data = await response.json();
//     setListings(data);
//   }

//   useEffect(() => {
//     fetchListings();
//   }, []);

// <div>
// {listings.map((listing, k) => (
//  <ListingCard key={k} listing={listing} />
// ))}
// </div>

// import React from "react";
// import styled from "styled-components";

// const Card = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   border: 1px solid #ddd;
//   border-radius: 5px;
//   box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
//   margin: 20px;
//   padding: 20px;
//   width: 300px;
// `;

// const Image = styled.img`
//   width: 100%;
//   height: 200px;
//   object-fit: cover;
//   border-radius: 5px;
// `;

// const Price = styled.h2`
//   color: #333;
//   font-size: 24px;
// `;

// const Address = styled.p`
//   color: #666;
//   font-size: 16px;
// `;

// const Details = styled.ul`
//   list-style: none;
//   padding: 0;
//   color: #333;
//   font-size: 16px;
// `;

// const Detail = styled.li`
//   margin-bottom: 5px;
// `;

// export default function ListingCard({ listing }) {
//   return (
//     <Card>
//       <Image src={listing.imageUrl} alt="Listing" />
//       <Price>${listing.price.toLocaleString()}</Price>
//       <Address>{listing.address.replace("\n", ", ")}</Address>
//       <Details>
//         {listing.details.map((detail, index) => (
//           <Detail key={index}>{detail}</Detail>
//         ))}
//       </Details>
//     </Card>
//   );
// }

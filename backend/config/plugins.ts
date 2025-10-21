// export default ({ env }) => ({
//   upload: {
//     config: {
//       provider: 'aws-s3',
//       providerOptions: {
//         endpoint: env('S3_ENDPOINT'), // ex: https://<accountid>.r2.cloudflarestorage.com
//         accessKeyId: env('S3_ACCESS_KEY_ID'),
//         secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
//         params: {
//           Bucket: env('S3_BUCKET'),
//         },
//       },
//       actionOptions: {
//         upload: {},
//         delete: {},
//       },
//     },
//   },
// });

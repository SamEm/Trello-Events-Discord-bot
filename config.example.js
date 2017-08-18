let config = {
  botToken: '',
  trelloKey: '',
  trelloToken: '',
  delayS: 15, // in seconds
  pollFrequencyInS: 5000, // in seconds

  firstTimeSetup: true,

  boards: ['Vqrkz3KO', 'AExxR9lU', 'UyU76Esh', 'vLPlnX60'], // ['board', 'board2', ...]
  verifiedListIDs: ['57fe7f78ddde6b37323bd670', '57716787a06d09cf7e0dd1ca', '5846f9fdcab93bbf78e80e04', '57fe7f909aa7fe383d56406b'], // ['listID', 'listID', ...]
  postChannelID: '340157859998334977'
}
module.exports = config;

var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/scanandro/scanandro.github.io', // Update to point to your repository  
        user: {
            name: 'scanandro', // update to use your name
            email: 'mulham@scanandro.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)

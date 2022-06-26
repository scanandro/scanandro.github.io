<script>
	import { Router, Link, Route } from "svelte-navigator";
	import DropZone from "svelte-atoms/DropZone.svelte";
    import Cookie from "js-cookie";

    $: result = '';
    let msg = '';
    let Domain = 'http://78.186.198.48/api/v1/';
	let fileName = "";
    let fileSize = 0.0;
    let disabled = false;
    let buttonTitle = 'Select file';
    let category = '';
    let End = false;
    let New = false;
    let fileType = "";
    let ErrorMsg = ''; 
    const onChange = async e =>  {
        ErrorMsg= '';
        End = false;
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    fileName = file ? file.name : "";
    fileSize = file ? file.size : 0.0;
    fileType = file ? file.type : "";
    if (fileSize > 5000000){
        ErrorMsg = "The File size is greater than the 5 MB limit";
        buttonTitle = 'Error!';
        End = true;
        return;
    }
    if (fileType != "application/vnd.android.package-archive"){
        ErrorMsg = "Only APK files are accepted";
        buttonTitle = 'Error!';
        End = true;
        return;
    }

    disabled = true;
    buttonTitle = 'The file is being processed...'
    let reader = new FileReader();
        reader.onload = function(ev) {
            // 
            crypto.subtle.digest('SHA-256', ev.target.result).then( async hashBuffer => {
                // Convert hex to hash, see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
                 let hashResponse = await post(hashHex);
                 console.log(hashResponse);
                if (hashResponse != -1){
                    if (hashResponse == 0){
                        category = "SMS Malware";
                    }
                    else if (hashResponse == 1){
                        category = "Benign";
                    }
                    else if (hashResponse == 2){
                        category = "Banking Malware";
                    }
                    else if (hashResponse == 3){
                        category = "Adware";
                    } else  if (hashResponse == 4){
                        category = "Riskware";
                    }else{
                        ErrorMsg = hashResponse;
                    }
                    msg = "I know this file! There is no need to upload it." + "\n" + "It is " + category;
                    End = true;
                }
                else {
                    msg = 'I did not see this file before..uploading it...';
                    New = true;
                    let uploading = await upload(file);
                     if (uploading == 0){
                        category = "SMS Malware";
                    }
                    else if (uploading == 1){
                        category = "Benign";
                    }
                    else if (uploading == 2){
                        category = "Banking Malware";
                    }
                    else if (uploading == 3){
                        category = "Adware";
                    } else if (uploading == 4){
                        category = "Riskware";
                    }else{
                        ErrorMsg = uploading;
                    }
                    msg = "I think that this App is " + category;
                    End = true;
                }
                
                
            }).catch(ex => console.error(ex));
        };
        reader.onerror = function(err) {
            console.error("Failed to read file", err);
            msg= 'Failed to read the file'
        }
        
        reader.readAsArrayBuffer(file);
        // if (New){
            
        // }
    };
    async function post(hashHex) {
   

    const res = await fetch(Domain+'hash/',
   
    {
			method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${Cookie.get("token")}`,
            },
			body: JSON.stringify({
				"hash": hashHex,

			})
		}).catch(function() {
            ErrorMsg = "could not connect to the server"
        });
		 if (res.ok) {
            const json = await res.json();
            result = JSON.stringify(parseInt(json['result'],10));
            if (result.length > 2){
            result = JSON.stringify(json['result']);
           }
         }else{
             return ErrorMsg;
         }
         

         return result;
  }
  async function upload(file) {
    const formData = new FormData();
    formData.append('file', file);
   const res = await fetch(Domain,
  
   {
           method: "POST",
          

           body:  formData

           
       }).catch(function() {
            return "could not connect to the server"
        });
        if (res.ok) {
           const json = await res.json();
           
           result = JSON.stringify(parseInt(json['result'],10));
           if (result.length > 2){
            result = JSON.stringify(json['result']);
           }
                   
        }

        return result;
 }
  </script>


	  

  <Router>
    <header>
	<nav class="navMenu">
        <Link to="/">Home</Link>
        <Link to="about">About</Link>
        <div class="dot"></div>
	</nav>
    </header>
	<div>
        <main>
            <h1>ScanAndro<sup>Beta</sup></h1>
		<Route path="/">
           
                
                <p>Upload APK file Here to analyze it.</p>
              <p>By submitting data below, you are agreeing to our  <Link to="terms">Terms of Service</Link> and <Link to="privacy">Privacy Policy</Link>.
              </p>
                <DropZone buttonTitle={buttonTitle} disabled={disabled} fileTitle={fileName} dropOnPage on:drop={onChange} on:change={onChange}/>
                {#if ErrorMsg}
                <p>{ErrorMsg}</p>
                {:else}
                <p>{msg}</p>
                {/if}
                {#if New && !End }
                    <p>The Analyzing process can take up to ten minutes. please be patient</p>
                    <p>The server will automatically terminate the process after 10 minutes</p>
                {/if}
                
                {#if End}
                    <p>End.</p>
                {/if}
            
           
		</Route>
        <Route path="about">
            <div class="about">
            <h3>About</h3>
            <p>ScanAndro is an Android Malware Detection system based on static analysis 
                and Deep Learning. It is made by <a href="https://www.linkedin.com/in/mulham-alibrahim/">me</a> as my graduation project
                from computer engineering department - Turkish-German University.
            </p>
            <b>How it wokrs</b>

                <ul>
                    <li>When you select or drop a valid APK file, the website calculate its hash
                         and send it to the server to check whether it exists in the database.
                    </li>
                    <li>If the hash of the file exists in the databse, the category of it is directly
                        given without the need to upload it.
                    </li>
                    <li>
                        If the hash does not exist then the file will be uploaded to the server.
                    </li>
                    <li>
                        when the file is uploaded to the server, the server will perform many processes to analyze and extract
                        specific data from it. which will be passesd then to the trained deep learning model to predict the category.
                    </li>
                   
                </ul><br>
                The prediction of the category of the APK file can be one of the following:
                <ul>
                <li><b>Benign</b> which means that the app is predicted to be safe to use.</li>
                <li><b>SMS Malware</b> the app is predicted to be malicious targeting personal and ctitic information in text messages.</li>
                <li><b>Banking Malware</b> the app is predicted to be malicious targeting Banking information, when you use banking apps in your mobile.</li>
                <li><b>Adware</b> the app is predicted to be malicious delivering annoying and unwanted popup advertisments.</li>
                <li><b>Riskware</b> which means the app is predicted to have potential risk due to security vulnerabilities, software incompatibility, or legal violations.</li>
            </ul><br>
            <b>Limits</b>
            <p>Due to limits in softwares and resources, the server right now can not accept files that are more than 5MB in size. 
                 </p>
                
                 <b>Contact</b>
               
                 <p>For questions, suggestions, or anything else you can contact me at: mulham@scanandro.com</p>
            </div>
          </Route>
          <Route path="terms"> 
            <div class="about">
              <p>These Terms of Service govern your access to and use of www.scanandro.com, and its products and services, and any uploaded, downloaded or appearing on the Service.
                Whether you are a member of the public, an antivirus, scanning, sandbox or other security partner, or a security-minded organization using and contributing Samples to the Service, by using any part of the Service, you agree and consent to these Terms of Service including terms that limit our liability or affect your legal rights, any referenced and incorporated guidelines and policies, including our Sample & Community Content Guidelines (which explain how to safely share Samples through the Service), the terms of our <Link to="/privacy">Privacy Policy</Link> (which explains how we may collect, use and share personal information you provide to us), and any additional terms specific to your particular use of the Service which become part of your agreement with us. If you are using the Service on behalf of a business, you represent to us that you have authority to bind that business or entity to these Terms, and that business accepts these Terms. </p>
                <b>Restrictions on Your Use of the Service</b>
                <br><br>
                You agree that you may not use or attempt to:
                <ul>
                    <li>Use the Service in any way that breaches any applicable local, national, or international law or regulation.</li>
                    <li>Use the Service in any way which could infringe the rights or interests of ScanAndro, or the Community,
                        including for example, to prove or disprove a concept or discredit, or bait any actor in the anti-malware space.
                    </li>
                    <li>Copy, reproduce, alter, modify, create derivative works, publicly display, republish, upload, post, transmit, resell or distribute in any way material, information or functionalities from the Service – including, without limitation, using the Service in any way for antivirus/URL scanner testing or that could directly or indirectly harm, compete with, or otherwise hinder the antivirus industry/URL scanner industry.</li>
                    <li>Transfer any rights granted to you under the Terms.</li>
                    <li>Use the Service for any illegal activity or output, or in any way that exposes ScanAndro, you, or members of the Community to harm.</li>
                    <li>Engage in any activity that could damage, overload, harm or impede the normal functioning of the Service.</li>
                    <li>Obtain or use any Samples except as specifically permitted by the Service or use or attempt to use the Service to mine information in any way that could identify individual persons in their private capacity, attempt to access or misappropriate content contained in any Sample, or otherwise use the Service or Samples for any purpose other than to detect and prevent malware in a non-commercial personal or organizational capacity.</li>
                    <li>Attempt to gain unauthorized access to our Site, the server on which our Site is stored or any server, computer or database connected to our Site.</li>
                    <li>Attack, or attempt to attack our Site via a denial-of-service attack or a distributed denial-of service attack.</li>
                    <li>Use or allow any third party under your control to submit Samples that are subject to the International Traffic in Arms Regulations (“ITAR”) maintained by the U.S. Department of State,  or otherwise use the Service except as expressly allowed under these Terms.</li>
                   
                </ul>
                <br><br>
                <b>Sample & Community Content Guidelines</b>
                <br><br>
                <p>
                    To the extent you elect to contribute any Sample to the Community, you confirm that all content contained in the Sample complies with these Terms and our <Link to="/privacy">Privacy Policy</Link>, that you are either the original owner of the Sample you submit or that you have the necessary rights and permissions to irrevocably contribute the Sample and share it, and information about it, with the Community.
                    <br><br>
                    You understand that if you submitting any Sample, the Sample is immediately shared for review by us and the Service’s Partners, and the resulting intelligence report is shared with you and with the Partners, which use the results to improve their own systems. As such, by contributing a Sample, you are contributing to the effort to raise global IT security levels.
                    <br><br>
                    While you retain any ownership rights in the original material contained in the Sample, when you upload or otherwise submit a copy of the Sample, you give ScanAndro (and those we work with) a worldwide, royalty free, irrevocable and transferable licence to use, edit, host, store, reproduce, modify, create derivative works, communicate, publish, publicly perform, publicly display and distribute all content contained in the Sample.
                    <br><br>
                    YOU FURTHER AGREE THAT YOU WILL ONLY UPLOAD SAMPLES THAT YOU WISH TO PUBLICLY SHARE AND THAT IN ANY CASE, YOU WILL NOT KNOWINGLY SUBMIT ANY SAMPLE TO THE SERVICE THAT CONTAINS CONFIDENTIAL OR COMMERCIALLY SENSITIVE DATA OR PERSONAL DATA OF ANY INDIVIDUAL WITHOUT LAWFUL PERMISSION.
                    <br><br>
                    Although we have no obligation to monitor use of the Service, user Content or any Samples, we may monitor the Service to detect and prevent fraudulent activity or violations of these Terms and retain absolute discretion to remove Samples, Content or users from the Service at any time and for any reason without notice. 
                    <br><br>
                    IF YOU DO NOT WANT TO PUBLICLY SHARE A SAMPLE IN THE MANNER SET OUT IN THESE TERMS OR IN THE <Link to="/privacy">PRIVACY POLICY</Link>, DO NOT SEND IT/CONTRIBUTE IT TO THE SERVICE AS THE SERVICE IS DESIGNED TO WORK THROUGH THE COLLECTIVE AGGREGATION AND SHARING OF THREAT-INTELLIGENCE WITH AND THROUGH THE COMMUNITY.
                    <br><br>
                    If you think someone is infringing your copyright, you can send us a notice of claimed infringement at mulham@scanandro.com, and we’ll take appropriate action. ScanAndro's policies provide for the termination, in appropriate circumstances, of repeat infringers’ access to the Service.
                </p>
                <br><br>
                <p>
                <b>ScanAndro Rights</b>
                <br><br>
                All rights, title, and interest in and to the Service are and will remain the exclusive property of ScanAndro and its licensors. Nothing in these Terms should be construed as conferring by implication or otherwise any license or right under any copyright, patent, trademark, database right, sui generis right or other intellectual property or proprietary interest of ScanAndro, its licensors or any third party. We reserve the right to remove any Samples without prior notice and at our sole discretion. Nothing in our Terms gives you a right to use the ScanAndro trademarks, logos, domain names, and other distinctive brand features.
               <br><br>
               Any Samples, feedback, comments, or suggestions you may provide to, or regarding ScanAndro or the Service is entirely voluntary. We are free to use any feedback, comments or suggestions as we see fit and without obligation to you and reserve the right to remove any Sample without prior notice and at our sole discretion.
               <br><br>
                <b>Changes in Service</b>
                <br><br>
                Service provided by ScanAndro is constantly evolving, and the form and nature of the Service that ScanAndro provides may change from time to time without prior notice to you. Any changes to the Service, including the release of new ScanAndro features, are subject to the Terms then in effect. In addition, ScanAndro may stop (permanently or temporarily) providing the Service (or any features within the Service) without providing prior notice. We also retain the right to create limits on your use of the Service including storage, at our sole discretion, at any time without prior notice to you.
                <br><br>
                <b>Disclaimers</b>
                <br><br>
                Your access to and use of the Service is at your own risk. You understand and agree that the Service is provided to you on an "AS IS" WITHOUT REPRESENTATION OR WARRANTY, WHETHER IT IS EXPRESS, IMPLIED, OR STATUTORY. WITHOUT LIMITING THE FOREGOING, ScanAndro SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                <br><br>
                WE DO NOT WARRANT OR GUARANTEE THAT THE SERVICES ARE ACCURATE, RELIABLE OR CORRECT; THAT THE SERVICES WILL MEET YOUR REQUIREMENTS; THAT THE SERVICES WILL BE AVAILABLE AT ANY PARTICULAR TIME OR LOCATION, UNINTERRUPTED, ERROR-FREE, WITHOUT DEFECT OR SECURE; THAT ANY DEFECTS OR ERRORS WILL BE CORRECTED; OR THAT THE SERVICES ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. 
                <br><br>
                We will not be liable for any loss or damage caused by a distributed denial-of-service attack, viruses or other technologically harmful material that may infect your computer equipment, computer programs, data or other proprietary material due to your access to or use of the Service or any third-party content or websites accessed through, or in any way in conjunction with, the Service.
                <br><br>
                Except as may be required by law and as set forth in our <Link to="/privacy">Privacy Policy</Link>, you further understand and agree that ScanAndro has no responsibility or liability for the deletion of, or the failure to store or transmit, any Sample, Content, other materials or communications maintained by the Service.
                <br><br>
                <b>Limitation of Liability</b>
                <br><br>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ScanAndro AND ITS PARENT, SUBSIDIARIES, AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, PARTNERS AND LICENSORS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL , EXEMPLARY OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER LOSSES, RESULTING FROM (i) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (ii) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY, INCLUDING WITHOUT LIMITATION, ANY DEFAMATORY, OFFENSIVE OR ILLEGAL CONDUCT OF OTHER USERS OR THIRD PARTIES; (iii) ANY CONTENT OBTAINED FROM THE SERVICES; AND (iv) UNAUTHORISED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS, SAMPLES OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
                <br><br>
                THIS LIMITATION OF LIABILITY SECTION APPLIES WHETHER THE ALLEGED LIABILITY IS BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR ANY OTHER BASIS, EVEN IF ScanAndro HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. THE FOREGOING LIMITATION OF LIABILITY WILL APPLY TO THE FULLEST EXTENT PERMITTED BY LAW IN THE APPLICABLE JURISDICTION.
                <br><br>
                <b>About These Terms</b>
                <br><br>
                Please note that we may update and amend these Terms from time to time and any changes will be posted on the Site. By continuing to access the Service after any changes become effective, you agree to be bound by the revised Terms.
                <br><br>
                The failure of ScanAndro to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision. In the event that any provision of these Terms is held to be invalid or unenforceable, the remaining provisions of these Terms will remain in full force and effect.
                <br><br>
                These Terms and any dispute or claim arising out of or in connection with them or their subject matter or formation (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of Türkiye. The Turkish courts will have exclusive jurisdiction over any claim arising from, or related to, the Service although we retain the right to bring proceedings against you for breach of the Terms in your country of residence or any other relevant country.
                <br><br>
                If you have any doubts as to whether your use of the Service complies with these Terms or have a concern with any aspect of the Site or the Service, please contact the manager at: mulham@scanandro.com
            </p>
            </div>
            </Route>
            <Route path="privacy">
                <div class="about">
                    <p>Thank you for your interest in ScanAndro. This Privacy Policy is designed to help you understand what information we collect, why we collect it, how we use it, and how you can update, manage, export, and/or delete your information. This policy further details how we use this information to support stronger global cybersecurity which includes the protection of members of the public, partners, and security-minded organizations that contribute to the Services.</p>
                    <br><br>
                    <b>Data Collection & Usage</b>
                    <br><br>
                    <p>We collect the samples that you upload according with the reports that are generated from our system during the analyzing process to improve our deep learning model and its prediction accuracy. these samples and reports may also be shared with security community.</p>
                    <br><br>
                    <b>Cookies and Similar Technologies</b>
                    <br><br>
                    When you use the Services, we send one or more cookies – small text files containing a string of alphanumeric characters – to your computer. For example, we use cookies to ensure proper navigation between pages on the Services. ScanAndro may use both session cookies and persistent cookies. A session cookie disappears after you close your browser. A persistent cookie remains after you close your browser and may be used by your browser on subsequent visits to the Services.
                    <br><br>
                    Persistent cookies can be removed. Please review your web browser’s “Help” file to learn the proper way to modify your cookie settings
                    <br><br>
                    We may also implement third party content on the Services, such as advertising or analytic service. We currently implement services provided by Google Analytics.

You may choose to control information collected by ScanAndro, including configuring your browser to indicate when ScanAndro has set a cookie in your browser. You can also configure your browser to block all cookies from a specific domain or all domains.
                    <br><br>
                    <br><br>
                </div>
            </Route>
    </main>
	</div>
</Router>



<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
        
	}
    .about{
        text-align: left;
    }
    nav {
  position: absolute;
  top: 30px;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
    }
   


	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 3em;
		font-weight: 100;
	}

	@media (min-width: 920px) {
		main {
			max-width: none;
		}
        h1{
            font-size: 4em;
        }
	}
    sup{
            vertical-align: super;
            font-size: small;
        }
</style>
const menu=document.querySelector('.menu'),nav=document.querySelector('#main-nav');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open)});
const toast=document.querySelector('.toast');function showToast(message){if(!toast)return;toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}
document.querySelectorAll('.download').forEach(button=>button.addEventListener('click',()=>showToast(`${button.dataset.name} will be available in the resource library soon.`)));
document.querySelectorAll('.notify').forEach(button=>button.addEventListener('click',()=>showToast('You’re on the list. New tutorials will appear here.')));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const canTilt=matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches;
if(canTilt){document.querySelectorAll('.signal-card,.service-card,.blog-card,.tutorial-card,.info-card').forEach(card=>{card.addEventListener('pointermove',event=>{const rect=card.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;card.style.setProperty('--tilt-x',`${(-y*4).toFixed(2)}deg`);card.style.setProperty('--tilt-y',`${(x*5).toFixed(2)}deg`);card.style.transform=`translateY(-6px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))`});card.addEventListener('pointerleave',()=>{card.style.removeProperty('transform')})})}

const steps = [
 {title:'Trim Scan',ref:'trim-scan',purpose:'Remove scan areas that are not needed for the framework design, such as excess scan base or stray geometry.',software:'Trim Scan lets you define a cutting plane or boundary and remove the unwanted part of the scan before surveying.',check:'Make sure the scan is oriented correctly and the cut will not remove anatomy or model areas needed for design.',recovery:'If the cut removes too much, stop and undo before continuing. Reposition the cut and inspect the preview from more than one angle.',verified:false},
 {title:'Survey and choose the path of insertion',ref:'survey',purpose:'Choose the direction the framework will use to seat on the model. This affects where undercuts appear and where blockout is needed.',software:'Survey evaluates the model relative to the chosen direction and helps identify undercut areas along the planned path of insertion.',check:'Look at the model from several angles and confirm the direction is compatible with the prescribed design and retentive areas.',recovery:'If the path looks wrong, return to Survey and review the tilt before adding more design details. Do not compensate for a bad path by blindly changing wax.',verified:false},
 {title:'Edit Blockout',ref:'edit-blockout',purpose:'Adjust the blockout wax after the survey so areas that should not lock the framework are filled while the intended design remains clear.',software:'The tool lets you add, remove, or reshape blockout material around the surveyed model.',check:'Check the insertion path, the undercut map, and the areas that need relief. Confirm that intended clasp-retention areas are not accidentally filled.',recovery:'If blockout covers the wrong area, return to Edit Blockout and make a small correction. Use the glossary definition of <a href="../index.html#glossary-undercut">undercut</a> as a reminder, then recheck the model from the insertion direction.',verified:false},
 {title:'Add framework parts',ref:'add-parts',purpose:'Add the components required by the prescription and planned design.',software:'PartialCAD places selected parts into the case so they can be positioned and adjusted.',check:'Confirm the component type and placement before moving on.',recovery:'If the wrong part was added, undo or remove it before adding the intended component.',verified:false},
 {title:'Draw the connector',ref:'draw-connector',purpose:'Define the outline of the connector that joins the framework components.',software:'The curve defines the connector boundary that can be edited before creating the component.',check:'Review the curve around teeth, gingiva and planned relief areas.',recovery:'Edit the curve points before proceeding to later refinement.',verified:false},
 {title:'Build the mesh or bar',ref:'mesh-connector',purpose:'Create the lattice or bar structure specified for the framework.',software:'The selected tool builds a component from the drawn outline or guide curves.',check:'Confirm the type, thickness and placement match the prescribed design.',recovery:'Return to the component settings and adjust the geometry before adding more parts.',verified:false},
 {title:'Add clasp and rest details',ref:'apply-clasps',purpose:'Add retentive and support features where they are part of the design.',software:'The tool positions clasp geometry or related framework details against the model.',check:'Check the clasp path, intended undercut and rest location against the prescription.',recovery:'Do not force a clasp into place to compensate for a wrong survey. Revisit Survey first if the insertion path looks inconsistent.',verified:false},
 {title:'Refine wax',ref:'smooth',purpose:'Clean up transitions and local surface irregularities after the main framework shape is in place.',software:'Smoothing and shaping tools adjust local wax geometry.',check:'Inspect the surface without hiding thin areas or removing intentional edges.',recovery:'Use small strokes and undo if a correction rounds off a feature that should remain defined.',verified:false},
 {title:'Edit local wax',ref:'smudge',purpose:'Make a targeted shape adjustment to a small area.',software:'Smudge moves material locally rather than creating a clean cut boundary.',check:'Keep the affected area small and inspect the transition around it.',recovery:'Undo large or lumpy changes, then use a smaller brush or a more suitable tool.',verified:false},
 {title:'Measure thickness',ref:'measure-wax',purpose:'Check whether the designed wax is within the thickness expected for the workflow.',software:'Measure Wax displays thickness information at the selected location.',check:'Measure thin-looking areas and transitions, not only broad flat surfaces.',recovery:'If the result is unexpected, confirm the measurement location and review the surrounding geometry.',verified:false},
 {title:'Assemble parts',ref:'assemble-parts',purpose:'Combine the designed components for the next stage of the workflow.',software:'Assembly joins or groups the components into the final framework build state.',check:'Confirm the parts are positioned correctly and no component is missing.',recovery:'If assembly looks wrong, inspect component placement and resolve overlaps before exporting.',verified:false},
 {title:'Save and export',ref:'save-build',purpose:'Keep an editable project copy and create the required output file for the next stage.',software:'Saving the project preserves the working scene; exporting an STL creates a mesh for downstream use.',check:'Confirm the project is saved and the exported file is the format requested by the lab workflow.',recovery:'Do not treat an STL as the editable project. Save the native project separately and export again if needed.',verified:false}
];
let current = 0;
let branch = '';
const el = id => document.getElementById(id);
const render = () => {
 const step = steps[current];
 el('step-count').textContent = 'STEP ' + (current + 1) + ' OF ' + steps.length;
 el('step-title').textContent = step.title;
 el('step-purpose').textContent = step.purpose;
 el('step-software').textContent = step.software;
 el('step-check').textContent = step.check;
 el('step-recovery').innerHTML = step.recovery;
 el('step-reference').href = '../index.html#' + step.ref;
 el('step-reference').textContent = step.title + ' reference ↗';
 el('progress-fill').style.width = ((current + 1) / steps.length * 100) + '%';
 el('previous-step').disabled = current === 0;
 el('next-step').disabled = current === steps.length - 1;
 el('next-step').textContent = current === steps.length - 1 ? 'You’re at the end' : 'Next step →';
};
document.querySelectorAll('[data-branch]').forEach(button => button.addEventListener('click', () => {
 branch = button.dataset.branch;
 document.querySelectorAll('[data-branch]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
 el('branch-note').textContent = branch === 'upper' ? 'Upper framework selected. Remember to review the planned palatal connector.' : branch === 'lower' ? 'Lower framework selected. Review the lingual or other prescribed connector.' : 'Flexible selected. Confirm that this case is intended for the appropriate flexible workflow.';
 try { localStorage.setItem('partialcad-learn-branch', branch); } catch (_) {}
}));
el('previous-step').addEventListener('click', () => { current = Math.max(0, current - 1); render(); });
el('next-step').addEventListener('click', () => { current = Math.min(steps.length - 1, current + 1); render(); });
try { const saved = localStorage.getItem('partialcad-learn-branch'); if (saved) document.querySelector('[data-branch="'+saved+'"]')?.click(); } catch (_) {}
render();
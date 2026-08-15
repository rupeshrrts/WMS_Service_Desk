const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

const componentsPath = path.join(__dirname, 'wms_frontend', 'app', 'dashboard', 'components.tsx');
const pagePath = path.join(__dirname, 'wms_frontend', 'app', 'dashboard', 'page.tsx');
const appPagePath = path.join(__dirname, 'wms_frontend', 'app', 'page.tsx');

// Fix components.tsx
replaceInFile(componentsPath, [
    // StatusBadge
    [/resolved: "bg-\\[#f1f5f9\\] border-\\[#e2e8f0\\] text-\\[#475569\\], \/\/ closed"/g, 'resolved: "bg-[#f1f5f9] border-[#e2e8f0] text-[#475569]",\n    escalated: "bg-[#fef3c7] border-[#fde68a] text-[#d97706]",\n    closed: "bg-[#e2e8f0] border-[#cbd5e1] text-[#64748b]",'],
    [/in_progress: "In Progress",\n    resolved: "Closed",/g, 'in_progress: "In Progress",\n    resolved: "Resolved",\n    escalated: "Escalated",\n    closed: "Closed",'],
    // Roles
    [/user\.role === "engineer"/g, '(user.role === "wms_engineer" || user.role === "wms_senior_engineer")'],
    [/user\.role === "customer"/g, '(user.role === "client_admin" || user.role === "client_operator")'],
    [/user\.role === "admin"/g, 'user.role === "wms_admin"'],
    // Ticket properties
    [/\.ticketId/g, '.ticket_id'],
    [/\.createdBy/g, '.created_by'],
    [/\.creatorName/g, '.creator_name'],
    [/\.createdAt/g, '.created_at'],
    [/\.assignedTo/g, '.assigned_to'],
    [/\.authorId/g, '.author_id'],
    [/\.authorName/g, '.author_name'],
    [/\.authorRole/g, '.author_role'],
    // Role Badges in comments
    [/admin: "bg-red-50 text-red-600 border-red-100",\n                    engineer: "bg-blue-50 text-blue-600 border-blue-100",\n                    customer: "bg-emerald-50 text-emerald-600 border-emerald-100",/g, 'wms_admin: "bg-red-50 text-red-600 border-red-100",\n                    wms_senior_engineer: "bg-blue-50 text-blue-600 border-blue-100",\n                    wms_engineer: "bg-blue-50 text-blue-600 border-blue-100",\n                    client_admin: "bg-emerald-50 text-emerald-600 border-emerald-100",\n                    client_operator: "bg-emerald-50 text-emerald-600 border-emerald-100",']
]);

// Fix dashboard/page.tsx
replaceInFile(pagePath, [
    // Roles
    [/user\.role === "engineer"/g, '(user.role === "wms_engineer" || user.role === "wms_senior_engineer")'],
    [/user\.role === "customer"/g, '(user.role === "client_admin" || user.role === "client_operator")'],
    [/user\.role === "admin"/g, 'user.role === "wms_admin"'],
    // Ticket properties
    [/\.createdBy/g, '.created_by'],
    [/\.creatorName/g, '.creator_name'],
    [/\.createdAt/g, '.created_at'],
    [/\.updatedAt/g, '.updated_at'],
    [/\.assignedTo/g, '.assigned_to'],
    [/\.assignedName/g, '.assigned_name']
]);

// Fix app/page.tsx
replaceInFile(appPagePath, [
    [/const success = login\(email\);/g, 'login(email).then((success) => {\n          if (success) { router.push("/dashboard"); }\n          else { setError("Invalid credentials"); }\n        });'],
    [/if \(success\) {\n          router\.push\("\/dashboard"\);\n        } else {\n          setError\("Invalid credentials"\);\n        }/g, '']
]);


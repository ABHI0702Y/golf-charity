import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import CharityAdminActions from '@/components/admin/CharityAdminActions'
import AddCharityForm from '@/components/admin/AddCharityForm'

export default async function AdminCharitiesPage() {
  const supabase = await createClient()
  const { data: charities } = await supabase
    .from('charities')
    .select('*, profiles(count)')
    .order('name')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Charity Management</h1>
        <p className="text-[#6b7c6e] text-sm mt-1">Add, edit, and feature charities</p>
      </div>

      <AddCharityForm />

      <div className="flex flex-col gap-4">
        {charities?.map(c => (
          <Card key={c.id} className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold">{c.name}</p>
                {c.featured && <Badge variant="active">Featured</Badge>}
              </div>
              <p className="text-sm text-[#6b7c6e] line-clamp-2">{c.description}</p>
              {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4ade80] hover:underline">{c.website}</a>}
            </div>
            <CharityAdminActions charityId={c.id} isFeatured={c.featured} />
          </Card>
        ))}
        {!charities?.length && <p className="text-center text-[#6b7c6e] py-8">No charities yet</p>}
      </div>
    </div>
  )
}

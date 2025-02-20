require 'csv'

class UpdateDnd2024SpellsForArtificer < ActiveRecord::Migration[8.0]
  def up
    Dnd2024::Spell.create!({
      slug: 'homunculus_servant',
      name: { en: 'Homunculus Servant', ru: 'Гомункул-прислужник' },
      data: {
        level: 2,
        school: 'conjuration',
        available_for: ['artificer'],
        source: 'UA'
      }
    })

    spells = CSV.parse(File.read(Rails.root.join('db/data/dnd2024_spells.csv')), headers: false, col_sep: ';')
    spell_slugs = spells.filter_map do |spell|
      next unless spell[6].include?('artificer')

      spell[1]
    end

    Dnd2024::Spell.where(slug: spell_slugs).each do |spell|
      spell.data.available_for << 'artificer'
      spell.save!
    end
  end

  def down; end
end

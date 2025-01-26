class AddSpentSpellSlotsToDnd5Characters < ActiveRecord::Migration[8.0]
  def change
    add_column :dnd5_characters, :spent_spell_slots, :jsonb, null: false, default: {}, comment: 'Потраченные слоты заклинаний по уровням'
  end
end

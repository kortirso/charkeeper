class UpdateHitDiceForCharacters < ActiveRecord::Migration[8.0]
  def up
    [::Dnd5::Character, ::Dnd2024::Character].each do |character_class|
      character_class.find_each do |character|
        character.data[:hit_dice] = { 6 => 0, 8 => 0, 10 => 0, 12 => 0 }
        character.data[:classes].each do |key, class_level|
          character.data[:hit_dice][character_class::HIT_DICES[key]] += class_level
        end
        character.save!
      end
    end
  end

  def down; end
end

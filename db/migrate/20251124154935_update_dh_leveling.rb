class UpdateDhLeveling < ActiveRecord::Migration[8.1]
  def up
    # Daggerheart::Character.find_each do |character|
    #   character.data.leveling = Daggerheart::CharacterData::LEVELING.merge(character.data.leveling)
    #   character.save
    # end
  end

  def down; end
end

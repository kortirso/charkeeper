# frozen_string_literal: true

describe Dnd5::Character::Spell do
  it 'factory should be valid' do
    dnd5_character_spell = build :dnd5_character_spell

    expect(dnd5_character_spell).to be_valid
  end
end

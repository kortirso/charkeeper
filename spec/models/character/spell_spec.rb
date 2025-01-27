# frozen_string_literal: true

describe Character::Spell do
  it 'factory should be valid' do
    character_spell = build :character_spell

    expect(character_spell).to be_valid
  end
end

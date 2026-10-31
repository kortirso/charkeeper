# frozen_string_literal: true

describe Character::Formula do
  it 'factory should be valid' do
    character_formula = build :character_formula

    expect(character_formula).to be_valid
  end
end

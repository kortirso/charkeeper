# frozen_string_literal: true

describe Character::Bonus do
  it 'factory should be valid' do
    character_bonus = build :character_bonus

    expect(character_bonus).to be_valid
  end
end

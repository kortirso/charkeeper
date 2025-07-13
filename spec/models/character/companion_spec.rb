# frozen_string_literal: true

describe Character::Companion do
  it 'factory should be valid' do
    character_companion = build :character_companion, :daggerheart

    expect(character_companion).to be_valid
  end
end

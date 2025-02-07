# frozen_string_literal: true

describe Character::Note do
  it 'factory should be valid' do
    character_note = build :character_note

    expect(character_note).to be_valid
  end
end

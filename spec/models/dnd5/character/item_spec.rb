# frozen_string_literal: true

describe Dnd5::Character::Item do
  it 'factory should be valid' do
    dnd5_character_item = build :dnd5_character_item

    expect(dnd5_character_item).to be_valid
  end
end

# frozen_string_literal: true

describe Character::Item do
  it 'factory should be valid' do
    character_item = build :character_item

    expect(character_item).to be_valid
  end
end

# frozen_string_literal: true

describe Character::Resource do
  it 'factory should be valid' do
    character_resource = build :character_resource

    expect(character_resource).to be_valid
  end
end

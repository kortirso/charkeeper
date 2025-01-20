# frozen_string_literal: true

describe Dnd5::Character do
  it 'factory should be valid' do
    dnd5_character = build :dnd5_character

    expect(dnd5_character).to be_valid
  end
end

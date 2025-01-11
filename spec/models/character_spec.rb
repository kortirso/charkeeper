# frozen_string_literal: true

describe Character do
  it 'factory should be valid' do
    character = build :character

    expect(character).to be_valid
  end
end

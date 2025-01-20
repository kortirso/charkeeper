# frozen_string_literal: true

describe Dnd5::Item do
  it 'factory should be valid' do
    dnd5_item = build :dnd5_item

    expect(dnd5_item).to be_valid
  end
end

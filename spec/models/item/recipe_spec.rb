# frozen_string_literal: true

describe Item::Recipe do
  it 'factory should be valid' do
    item_recipe = build :item_recipe

    expect(item_recipe).to be_valid
  end
end

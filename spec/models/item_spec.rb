# frozen_string_literal: true

describe Item do
  it 'factory should be valid' do
    item = build :item

    expect(item).to be_valid
  end
end

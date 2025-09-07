# frozen_string_literal: true

describe ActiveBotObject do
  it 'factory should be valid' do
    active_bot_object = build :active_bot_object

    expect(active_bot_object).to be_valid
  end
end

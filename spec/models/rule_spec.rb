# frozen_string_literal: true

describe Rule do
  it 'factory should be valid' do
    rule = build :rule

    expect(rule).to be_valid
  end
end

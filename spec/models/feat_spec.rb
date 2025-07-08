# frozen_string_literal: true

describe Feat do
  it 'factory should be valid' do
    feat = build :feat

    expect(feat).to be_valid
  end
end

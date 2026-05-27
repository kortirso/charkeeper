# frozen_string_literal: true

describe Upvote do
  it 'factory should be valid' do
    upvote = build :upvote

    expect(upvote).to be_valid
  end
end

# frozen_string_literal: true

describe Homebrew::Publication do
  it 'factory should be valid' do
    homebrew_publication = build :homebrew_publication

    expect(homebrew_publication).to be_valid
  end
end

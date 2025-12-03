# frozen_string_literal: true

describe AuthContext::AddUserCommand do
  subject(:command_call) { instance.call({ username: username, password: password, password_confirmation: password }) }

  let(:instance) { described_class.new }
  let(:username) { 'username' }
  let(:password) { '12345qwert' }

  it 'creates user', :aggregate_failures do
    expect { command_call }.to change(User, :count).by(1)
    expect(User::Book.count).to be_zero
    expect(command_call[:result].is_a?(User)).to be_truthy
  end

  context 'with homebrew books' do
    before { create :homebrew_book, shared: true }

    it 'creates user and attaches book', :aggregate_failures do
      expect { command_call }.to(
        change(User, :count).by(1)
          .and(change(User::Book, :count).by(1))
      )
      expect(command_call[:result].is_a?(User)).to be_truthy
    end
  end
end

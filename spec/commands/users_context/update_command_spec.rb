# frozen_string_literal: true

describe UsersContext::UpdateCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:user) { create :user, username: 'old', locale: 'ru' }
  let!(:perfect_user) { create :user, username: 'perfect' }

  context 'for username' do
    let(:params) { { user: user, username: username } }

    context 'for username in use' do
      let(:username) { 'perfect' }

      it 'does not update user', :aggregate_failures do
        expect(command_call[:errors]).not_to be_nil
        expect(user.reload.username).to eq 'old'
        expect(perfect_user.reload.username).to eq 'perfect'
      end
    end

    context 'for valid username' do
      let(:username) { 'nice' }

      it 'updates user', :aggregate_failures do
        expect(command_call[:errors]).to be_nil
        expect(user.reload.username).to eq 'nice'
      end
    end
  end

  context 'for locale' do
    let(:params) { { user: user, locale: locale } }

    context 'for invalid locale' do
      let(:locale) { 'es' }

      it 'does not update user', :aggregate_failures do
        expect(command_call[:errors]).not_to be_nil
        expect(user.reload.locale).to eq 'ru'
      end
    end

    context 'for valid locale' do
      let(:locale) { 'en' }

      it 'updates user', :aggregate_failures do
        expect(command_call[:errors]).to be_nil
        expect(user.reload.locale).to eq 'en'
      end
    end
  end

  context 'for password' do
    let(:params) { { user: user, password: password, password_confirmation: password_confirmation }.compact }
    let(:password) { '1234567892' }
    let(:password_confirmation) { '1234567892' }

    context 'for missing password_confirmation' do
      let(:password_confirmation) { nil }

      it 'does not update user', :aggregate_failures do
        expect(command_call[:errors]).not_to be_nil
        expect(user.reload.authenticate('1234567892')).to be_falsy
      end
    end

    context 'for differents passwords' do
      let(:password_confirmation) { '1234567891' }

      it 'does not update user', :aggregate_failures do
        expect(command_call[:errors]).not_to be_nil
        expect(user.reload.authenticate('1234567892')).to be_falsy
      end
    end

    context 'for short password' do
      let(:password) { '123456789' }

      it 'does not update user', :aggregate_failures do
        expect(command_call[:errors]).not_to be_nil
        expect(user.reload.authenticate('123456789')).to be_falsy
      end
    end

    context 'for valid passwords' do
      it 'updates user password', :aggregate_failures do
        expect(command_call[:errors]).to be_nil
        expect(user.reload.authenticate('1234567892')).to be_truthy
      end
    end
  end
end

# frozen_string_literal: true

module AuthContext
  class AddIdentityCommand < BaseCommand
    use_contract do
      Providers = Dry::Types['strict.string'].enum(*User::Identity.providers.keys)

      params do
        required(:provider).filled(Providers)
        required(:uid).filled(:string)
        optional(:user).filled(type?: User)
        optional(:username).filled(:string)
      end
    end

    private

    def do_prepare(input)
      input[:user] = add_user if input[:user].nil?
    end

    def do_persist(input)
      result = User::Identity.create!(input)

      { result: result }
    rescue ActiveRecord::RecordNotUnique => _e
      { errors: { identity: ['Already exists'] } }
    end

    def add_user
      User.create!
    end
  end
end

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
        optional(:locale).filled(:string)
      end
    end

    private

    def do_prepare(input)
      input[:user] = add_user(input) if input[:user].nil?
      input[:locale] = I18n.default_locale if I18n.available_locales.exclude?(input[:locale])
    end

    def do_persist(input)
      result = User::Identity.create!(input.except(:locale))

      { result: result }
    rescue ActiveRecord::RecordNotUnique => _e
      { errors: { identity: ['Already exists'] } }
    end

    def add_user(input)
      User.create!(input.slice(:locale))
    end
  end
end

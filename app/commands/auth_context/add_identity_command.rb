# frozen_string_literal: true

module AuthContext
  class AddIdentityCommand < BaseCommand
    include Deps[
      add_user: 'commands.auth_context.add_user'
    ]

    use_contract do
      Providers = Dry::Types['strict.string'].enum(*User::Identity.providers.keys)

      params do
        required(:provider).filled(Providers)
        required(:uid).filled(:string)
        optional(:user).filled(type?: User)
        optional(:first_name).maybe(:string)
        optional(:last_name).maybe(:string)
        optional(:username).maybe(:string)
        optional(:locale).maybe(:string)
      end
    end

    private

    def do_prepare(input)
      input[:user] = create_user(input) if input[:user].nil?
      input[:locale] = I18n.default_locale if input[:locale].blank? || I18n.available_locales.exclude?(input[:locale])
    end

    def do_persist(input)
      result = User::Identity.create!(input.except(:locale))

      { result: result }
    rescue ActiveRecord::RecordNotUnique => _e
      { errors: { identity: ['Already exists'] } }
    end

    def create_user(input)
      password = SecureRandom.alphanumeric(24)
      add_user.call({
        username: SecureRandom.alphanumeric(12),
        locale: input[:locale],
        password: password,
        password_confirmation: password
      })[:result]
    end
  end
end

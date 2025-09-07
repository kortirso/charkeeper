# frozen_string_literal: true

module HomebrewContext
  class AddBookCommand < BaseCommand
    use_contract do
      config.messages.namespace = :homebrew_book

      Providers = Dry::Types['strict.string'].enum('daggerheart')

      params do
        required(:user).filled(type?: ::User)
        required(:name).filled(:string, max_size?: 50)
        required(:provider).filled(Providers)
      end
    end

    private

    def do_prepare(input)
      return unless ::Homebrew::Book.exists?(input)

      input[:name] = "#{input[:name]} ##{SecureRandom.alphanumeric(6)}"
    end

    def do_persist(input)
      result = ::Homebrew::Book.create!(input)

      { result: result }
    end
  end
end

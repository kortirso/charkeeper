# frozen_string_literal: true

module HomebrewContext
  class AddRaceCommand < BaseCommand
    include Deps[
      refresh_user_data: 'services.homebrews_context.refresh_user_data'
    ]

    SIZES = %w[small medium large].freeze
    DAMAGE_TYPES = %w[bludge pierce slash acid cold fire force lighting necrotic poison psychic radiant thunder].freeze

    use_contract do
      config.messages.namespace = :homebrew_race

      params do
        required(:user).filled(type?: ::User)
        required(:type).filled(:string)
        required(:name).filled(:string, max_size?: 50)
        optional(:speed).filled(:integer)
        optional(:resistance).value(:array).each(included_in?: DAMAGE_TYPES)
        optional(:size).value(:array).each(included_in?: SIZES)
      end
    end

    private

    def do_prepare(input)
      input[:data] = input.except(:user, :type, :name)
    end

    def do_persist(input)
      result = input[:type].constantize.create!(input.slice(:user, :name, :data))

      refresh_user_data.call(user: input[:user])

      { result: result }
    end
  end
end

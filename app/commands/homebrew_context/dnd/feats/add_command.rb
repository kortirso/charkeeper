# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Feats
      class AddCommand < BaseCommand
        # include Deps[formula: 'formula']

        # rubocop: disable Metrics/BlockLength
        use_contract do
          config.messages.namespace = :homebrew_feat

          Origins = Dry::Types['strict.string'].enum('subclass', 'feat')
          Kinds = Dry::Types['strict.string'].enum('static', 'text', 'update_result', 'hidden')
          Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'one_at_short_rest')

          params do
            required(:user).filled(type?: ::User)
            required(:title).filled(:string, max_size?: 50)
            optional(:description).filled(:string, max_size?: 1000)
            required(:origin).filled(Origins)
            required(:origin_value).filled(:string)
            required(:kind).filled(Kinds)
            required(:level).filled(:integer, gteq?: 1)
            optional(:limit).filled(:integer, gteq?: 1)
            optional(:limit_refresh).filled(Limits)
            optional(:modifiers).hash
            optional(:continious).filled(:bool)
            optional(:static_spells).hash
            optional(:ability_conditions).maybe(:array).each(:string)
            optional(:leveling_ability_boosts).maybe(:array).each(:string)
          end

          rule(:limit, :limit_refresh).validate(:check_all_or_nothing_present)
          rule(:origin, :origin_value, :user) do
            origin =
              case values[:origin]
              when 'subclass'
                ::Dnd2024::Homebrew::Subclass.find_by(user_id: values[:user].id, id: values[:origin_value])
              when 'feat' then true
              end
            next if origin

            key(:origin).failure(:not_found)
          end
        end
        # rubocop: enable Metrics/BlockLength

        private

        # def validate_content(input)
        #   return unless input.key?(:modifiers)
        #   return if input[:modifiers].values.all? { |value| formula.call(formula: value).present? }

        #   [I18n.t('commands.homebrew_context.dnd.feats.add.invalid_formula')]
        # end

        def do_prepare(input) # rubocop: disable Metrics/AbcSize
          input[:origin_value] = sanitize(input[:origin_value])
          input[:conditions] = { level: input[:level] }
          if input.key?(:ability_conditions) && input[:origin] == 'feat'
            input[:conditions][:ability] = input[:ability_conditions]
          end
          input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
          input[:info] = { static_spells: input[:static_spells] }
          if input.key?(:leveling_ability_boosts) && input[:origin] == 'feat'
            input[:info][:rewrite] = { ability_boosts: input[:leveling_ability_boosts], leveling_ability_boosts: 1 }
          end
          input[:title] = { en: sanitize(input[:title]), ru: sanitize(input[:title]) }
          input[:description] = { en: sanitize(input[:description]), ru: sanitize(input[:description]) }
        end

        def do_persist(input)
          result =
            ::Dnd2024::Feat.create!(input.except(:limit, :level, :static_spells, :ability_conditions, :leveling_ability_boosts))

          { result: result }
        end
      end
    end
  end
end

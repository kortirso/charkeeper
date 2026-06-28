# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Backgrounds
        class CopyCommand < BaseCommand
          use_contract do
            params do
              required(:background).filled(type?: ::Dnd2024::Homebrews::Background)
              required(:user).filled(type?: ::User)
            end
          end

          private

          def do_prepare(input) # rubocop: disable Metrics/AbcSize
            input[:attributes] = input[:background].attributes.slice('title', 'description', 'public').symbolize_keys
            input[:attributes][:user] = input[:user]
            input[:attributes][:selected_feat] = input[:background].info['selected_feats'].first
            input[:attributes][:selected_skills] = input[:background].info['selected_skills']
            input[:attributes][:ability_boosts] = input[:background].info['ability_boosts']
          end

          def do_persist(input)
            HomebrewsV2Context::Import::Dnd2024::Backgrounds::AddCommand.new.call(input[:attributes])
          end
        end
      end
    end
  end
end

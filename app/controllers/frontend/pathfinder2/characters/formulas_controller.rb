# frozen_string_literal: true

module Frontend
  module Pathfinder2
    module Characters
      class FormulasController < Frontend::BaseController
        include Deps[
          add_formula: 'commands.characters_context.pathfinder2.formulas.add'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character
        before_action :find_item, only: %i[create]
        before_action :find_formula, only: %i[destroy]

        def index
          serialize_relation_v2(formulas, ::Pathfinder2::Characters::FormulaSerializer, :formulas)
        end

        def create
          case add_formula.call(character: @character, item: @item)
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Pathfinder2::Characters::FormulaSerializer, :formula, {}, :created)
          end
        end

        def destroy
          @formula.destroy
          only_head_response
        end

        def find_by_item
          @character.formulas.find_by!(item_id: params.expect(:item_id))
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).pathfinder2.find(params.expect(:character_id))
        end

        def formulas
          @character.formulas.includes(:item)
        end

        def find_item
          @item = ::Pathfinder2::Item.find(params.expect(:item_id))
        end

        def find_formula
          @formula = @character.formulas.find(params.expect(:id))
        end
      end
    end
  end
end

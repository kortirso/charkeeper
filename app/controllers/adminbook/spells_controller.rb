# frozen_string_literal: true

module Adminbook
  class SpellsController < Adminbook::BaseController
    def index
      @spells = Spell.where(type: spell_class.to_s).order(order_sql)
    end

    def new
      @spell = spell_class.new
    end

    def edit
      @spell = spell_class.find(params[:id])
    end

    def create
      spell = spell_class.new(transform_params(spell_params))
      redirect_to adminbook_spells_path(provider: params[:provider]) if spell.save
    end

    def update
      spell = spell_class.find(params[:id])
      redirect_to adminbook_spells_path(provider: params[:provider]) if spell.update(transform_params(spell_params))
    end

    def destroy
      spell = spell_class.find(params[:id])
      spell.destroy
      redirect_to adminbook_spells_path(provider: params[:provider])
    end

    private

    def spell_class
      case params[:provider]
      when 'dnd5' then ::Dnd5::Spell
      end
    end

    def order_sql
      case params[:provider]
      when 'dnd5' then Arel.sql("data ->> 'school' ASC, data ->> 'level' ASC")
      end
    end

    def transform_params(updating_params)
      updating_params['data'] = JSON.parse(updating_params['data'].gsub(' =>', ':').gsub('nil', 'null'))
      updating_params
    end

    def spell_params
      params.expect(spell: [:slug, :data, { name: %i[en ru] }])
    end
  end
end
